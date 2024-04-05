import { join } from "path"
import sharp, { Sharp } from "sharp"
import { Compiler, Compilation } from "webpack"
import { SharpReturn, handleSharp, isNumArray } from "./utils"
import Table from "cli-table"

const DEFAULT_FORMAT = "png"
const DEFAULT_GRAYSCALE = false
const DEFAULT_IMG_NAME = "icon"
const DEFAULT_LOG = false

interface Options {
  original: string
  output: string
  size: number[] | number
  format?: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
  grayscale?: boolean
  imgName?: string
  log?: boolean
}

interface Handler {
  generator: Sharp
  size: number
  compiler: Compiler
  compilation: Compilation
}

class Plugin {
  public readonly original: string
  public readonly output: string
  public readonly size: number[] | number
  public readonly format: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
  public readonly grayscale: boolean
  public readonly imgName: string
  public readonly log: boolean
  public logger: ReturnType<Compilation["getLogger"]>
  public info: string

  constructor(options: Options) {
    this.original = options.original
    this.output = options.output
    this.size = options.size

    if (options.format) {
      this.format = options.format
    } else {
      this.format = DEFAULT_FORMAT
    }

    if (typeof options.grayscale !== "undefined") {
      this.grayscale = options.grayscale
    } else {
      this.grayscale = DEFAULT_GRAYSCALE
    }

    if (options.imgName) {
      this.imgName = options.imgName
    } else {
      this.imgName = DEFAULT_IMG_NAME
    }

    if (typeof options.log !== "undefined") {
      this.log = options.log
    } else {
      this.log = DEFAULT_LOG
    }
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap("generate-icon-webpack-plugin", (compilation: Compilation): void => {
      this.logger = compiler.getInfrastructureLogger("generate-icon-webpack-plugin")

      compilation.hooks.processAssets.tapAsync(
        {
          name: "generate-icon-webpack-plugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async (assets: Compilation["assets"], callback: CallableFunction): Promise<void> => {
          try {
            await this.generate(compiler, compilation)
            callback()
          } catch (err) {
            callback(err)
            this.logger.error(err)
          }
        },
      )

      compilation.hooks.statsPrinter.tap("generate-icon-webpack-plugin", (): void => {
        if (this.log && typeof this.info !== "undefined") {
          console.log("")
          console.log("[generate-icon-webpack-plugin]")
          console.log(this.info)
          console.log("")
        }
      })
    })
  }

  private handleLog(data: string[][]): string {
    const table = new Table({
      head: ["format", "width", "height", "channels", "premultiplied", "size"],
      style: { head: ["green"] },
    })

    table.push(...data)

    return table.toString()
  }

  private async handleGenerate(handler: Handler): Promise<string[]> {
    const data: string[] = []
    const generate: Promise<SharpReturn> = handleSharp({
      generator: handler.generator,
      format: this.format,
      size: handler.size,
    })

    const { buffer, info } = await generate

    const source = new handler.compiler.webpack.sources.RawSource(buffer)
    const outputDir: string = this.output
    const file = `${outputDir}/${this.imgName}${handler.size}.${this.format}`
    handler.compilation.emitAsset(file, source)

    const outputPath = `${join(handler.compiler.outputPath, outputDir)}/${this.imgName}${handler.size}.${this.format}`

    data.push(
      String(info["format"]),
      String(info["width"]),
      String(info["height"]),
      String(info["channels"]),
      String(info["premultiplied"]),
      String(info["size"]),
    )

    if (this.log) {
      console.log(`${this.imgName}${handler.size}.${this.format} -> ${outputPath}`)
    }

    return data
  }

  private async generate(compiler: Compiler, compilation: Compilation): Promise<void> {
    try {
      const infoList: string[][] = []
      const generator: Sharp = sharp(this.original)

      if (this.grayscale) {
        generator.grayscale()
      }

      if (typeof this.size === "number") {
        const data: string[] = await this.handleGenerate({
          generator: generator,
          size: this.size,
          compiler: compiler,
          compilation: compilation,
        })

        infoList.push(data)
        this.info = this.handleLog(infoList)
      }

      if (this.size instanceof Array && isNumArray(this.size)) {
        for (const key in this.size) {
          const data: string[] = await this.handleGenerate({
            generator: generator,
            size: this.size[key],
            compiler: compiler,
            compilation: compilation,
          })

          infoList.push(data)
        }

        this.info = this.handleLog(infoList)
      }
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }
}

export default Plugin
