import sharp, { Sharp } from "sharp"
import { Compiler, Compilation } from "webpack"
import { SharpReturn, handlePath, handleSharp, isNumArray } from "./utils"
import Table from "cli-table"

const DEFAULT_FORMAT = "png"
const DEFAULT_GRAYSCALE = false
const DEFAULT_IMG_NAME = "icon"
const DEFAULT_LOG = false

interface Options {
  original: string
  outputDir: string
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
  public readonly outputDir: string
  public readonly size: number[] | number
  public readonly format: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
  public readonly grayscale: boolean
  public readonly imgName: string
  public readonly log: boolean
  public logger: ReturnType<Compilation["getLogger"]>
  public info: string

  constructor(options: Options) {
    this.original = options.original
    this.outputDir = options.outputDir
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

      compilation.hooks.processAssets.tap(
        {
          name: "generate-icon-webpack-plugin",
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        (): void => {
          this.generate(compiler, compilation)
        },
      )

      compilation.hooks.statsPrinter.tap("generate-icon-webpack-plugin", (): void => {
        if (this.log && typeof this.info !== "undefined") {
          console.log("[generate-icon-webpack-plugin]")
          console.log(this.info)
          console.log("")
        }
      })
    })
  }

  private handleLog(data: string[][]): string {
    const table = new Table({
      head: ["format", "width", "height", "channels", "premultiplied", "size", "path"],
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
    const path: string = handlePath(this.outputDir)
    handler.compilation.emitAsset(`${path}/${this.imgName}${handler.size}.${this.format}`, source)

    const outputPath: string = `${this.outputDir}/${this.imgName}/${handler.size}.${this.format}`

    data.push(
      String(info["format"]),
      String(info["width"]),
      String(info["height"]),
      String(info["channels"]),
      String(info["premultiplied"]),
      String(info["size"]),
      String(outputPath),
    )

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
        for (const size in this.size) {
          const data: string[] = await this.handleGenerate({
            generator: generator,
            size: this.size[size],
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
