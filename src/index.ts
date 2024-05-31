import { Compilation, Compiler } from "webpack"
import { setTable, jimp_resolver } from "./utils"
import type { Bitmap, Format } from "./utils"
import path from "path"

interface GenerateIconWebpackPluginOptions {
  logo: string
  dir?: string
  size?: number[] | number
  formart?: Format
  grayscale?: boolean
  imgName?: string
  log?: boolean
}

class GenerateIconWebpackPlugin {
  private readonly pluginName: string = "generate-icon-webpack-plugin"
  private readonly info: string[][] = []

  private readonly logo: string
  private readonly dir: string
  private readonly size: number[] | number
  private readonly format: Format
  private readonly grayscale: boolean
  private readonly imgName: string
  private readonly log: boolean

  private compiler: Compiler
  private compilation: Compilation

  public constructor(options: GenerateIconWebpackPluginOptions) {
    this.logo = options.logo
    this.dir = options.dir || "icons"
    this.size = options.size || [16, 32, 48, 64, 128]
    this.format = options.formart || "png"
    this.grayscale = options.grayscale || false
    this.imgName = options.imgName || "icon"
    this.log = options.log || false
  }

  public apply(compiler: Compiler): void {
    this.compiler = compiler
    this.thisCompilation()
  }

  private thisCompilation(): void {
    this.compiler.hooks.thisCompilation.tap(this.pluginName, (compilation: Compilation): void => {
      compilation.fileDependencies.add(this.logo)
      this.compilation = compilation
      this.processAssets()
    })
    this.compiler.hooks.done.tap(this.pluginName, (): void => {
      this.statsPrinter()
    })
  }

  private processAssets(): void {
    this.compilation.hooks.processAssets.tapPromise(
      {
        name: this.pluginName,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      async (): Promise<void> => {
        const absoluteOutputPath: string = path.resolve(this.compiler.options.output.path || process.cwd(), this.dir)
        const promises: Promise<
          {
            outputFilename: string
            info: Bitmap
            file: string
            source: Buffer
          }[]
        > = this.getPromise(absoluteOutputPath)

        const data: {
          outputFilename: string
          info: Bitmap
          file: string
          source: Buffer
        }[] = await promises

        data.forEach((value: { outputFilename: string; info: Bitmap; file: string; source: Buffer }): void => {
          const source = new this.compilation.compiler.webpack.sources.RawSource(value.source, false)
          this.compilation.emitAsset(value.file, source, {
            sourceFilename: value.outputFilename,
            size: value.source.length,
          })
          this.outputLog(value.outputFilename)
          this.outputInfo(value.info)
        })
      },
    )
  }

  private statsPrinter(): void {
    this.compilation.hooks.statsPrinter.tap(this.pluginName, (): void => {
      const hasData: boolean = this.info.every((data: string[]): boolean => data.length > 0)

      if (this.log && hasData) {
        const info_table: string = setTable(this.info)
        console.log()
        console.log("[generate-icon-webpack-plugin]")
        console.log(info_table)
        console.log()
      }

      this.info.length = 0
    })
  }

  private getPromise(absoluteOutputPath: string): Promise<
    {
      outputFilename: string
      info: Bitmap
      file: string
      source: Buffer
    }[]
  > {
    const promises: Promise<{
      outputFilename: string
      info: Bitmap
      file: string
      source: Buffer
    }>[] =
      typeof this.size === "number"
        ? [this.generate(this.size, absoluteOutputPath)]
        : this.size.map(
            (
              size: number,
            ): Promise<{
              outputFilename: string
              info: Bitmap
              file: string
              source: Buffer
            }> => this.generate(size, absoluteOutputPath),
          )
    return Promise.all(promises)
  }

  private async generate(
    size: number,
    absoluteOutputPath: string,
  ): Promise<{
    outputFilename: string
    info: Bitmap
    file: string
    source: Buffer
  }> {
    const outputFilename: string =
      typeof this.size === "number" || this.size.length === 1
        ? `${this.imgName}.${this.format}`
        : `${this.imgName}-${size}.${this.format}`

    const { data, info } = await jimp_resolver(this.logo, size, this.format, this.grayscale)

    const absFile: string = path.resolve(absoluteOutputPath, outputFilename)
    const file: string = path.relative(this.compiler.outputPath, absFile)
    const source: Buffer = data
    return { outputFilename, info, file, source }
  }

  private outputLog(outputFilename: string): void {
    if (this.log) {
      const outputPath: string = path.join(this.compiler.outputPath, this.dir, outputFilename)
      console.log(`${outputFilename} -> ${outputPath}`)
    }
  }

  private outputInfo(info: Bitmap): void {
    const data: string[] = []
    if (this.log) {
      const size: number = info.data.length

      data.push(
        String(info.width),
        String(info.height),
        String(info.depth),
        String(info.alpha),
        String(info.color),
        String(info.colorType),
        String(info.bpp),
        String(info.interlace),
        String(info.palette),
        String(info.gamma),
        String(size),
      )
      this.info.push(data)
    }
  }
}

export = GenerateIconWebpackPlugin
