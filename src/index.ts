import { FormatEnum, OutputInfo } from "sharp"
import { Compilation, Compiler } from "webpack"
import { setTable, sharp_resolver } from "./utils"
import path from "path"

interface GenerateIconWebpackPluginOptions {
  original: string
  output?: string
  size: number[] | number
  formart?: keyof FormatEnum
  grayscale?: boolean
  imgName?: string
  log?: boolean
}

class GenerateIconWebpackPlugin {
  private readonly name: string = "generate-icon-webpack-plugin"
  private info: string[][] = []

  private readonly original: string
  private readonly output: string
  private readonly size: number[] | number
  private readonly format: keyof FormatEnum
  private readonly grayscale: boolean
  private readonly imgName: string
  private readonly log: boolean

  private compiler: Compiler
  private compilation: Compilation

  public constructor(options: GenerateIconWebpackPluginOptions) {
    this.original = options.original
    this.output = options.output || "icons"
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
    this.compiler.hooks.thisCompilation.tap(this.name, (compilation: Compilation): void => {
      this.compilation = compilation
      this.processAssets()
    })
  }

  private statsPrinter(): void {
    this.compilation.hooks.statsPrinter.tap(this.name, (): void => {
      const hasData: boolean = this.info.every((data: string[]): boolean => data.length > 0)

      if (this.log && hasData) {
        const info_table: string = setTable(this.info)
        console.log()
        console.log("[generate-icon-webpack-plugin]")
        console.log(info_table)
        console.log()
      }
      this.info = []
    })
  }

  private processAssets(): void {
    this.compilation.hooks.processAssets.tapPromise(
      {
        name: this.name,
        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
      },
      async (): Promise<void> => {
        const promises: Promise<
          {
            outputFilename: string
            info: OutputInfo
          }[]
        > = this.getPromise()

        const data: {
          outputFilename: string
          info: OutputInfo
        }[] = await promises

        data.forEach((value: { outputFilename: string; info: OutputInfo }): void => {
          this.outputLog(value.outputFilename)
          this.outputInfo(value.info)
        })

        this.statsPrinter()
      },
    )
  }

  private getPromise(): Promise<
    {
      outputFilename: string
      info: OutputInfo
    }[]
  > {
    const promises: Promise<{
      outputFilename: string
      info: OutputInfo
    }>[] =
      typeof this.size === "number"
        ? [this.generate(this.size)]
        : this.size.map(
            (
              size: number,
            ): Promise<{
              outputFilename: string
              info: OutputInfo
            }> => this.generate(size),
          )
    return Promise.all(promises)
  }

  private async generate(size: number): Promise<{
    outputFilename: string
    info: OutputInfo
  }> {
    const outputFilename: string =
      typeof this.size === "number" || this.size.length === 1
        ? `${this.imgName}.${this.format}`
        : `${this.imgName}-${size}.${this.format}`

    const { data, info } = await sharp_resolver(this.original, size, this.format, this.grayscale)

    const file: string = path.join(this.output, outputFilename)
    const source = new this.compilation.compiler.webpack.sources.RawSource(data)
    this.compilation.emitAsset(file, source)
    return { outputFilename, info }
  }

  private outputLog(outputFilename: string): void {
    if (this.log) {
      const outputPath: string = path.join(this.compiler.outputPath, this.output, outputFilename)
      console.log(`${outputFilename} -> ${outputPath}`)
    }
  }

  private outputInfo(info: OutputInfo): void {
    const data: string[] = []
    if (this.log) {
      data.push(
        String(info["format"]),
        String(info["width"]),
        String(info["height"]),
        String(info["channels"]),
        String(info["premultiplied"]),
        String(info["size"]),
      )
      this.info.push(data)
    }
  }
}

export default GenerateIconWebpackPlugin
