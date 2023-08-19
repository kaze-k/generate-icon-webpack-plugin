import sharp, { Sharp } from "sharp"
import { Compiler, Compilation } from "webpack"
import { mkdirp } from "mkdirp"
import { handleLog, isNumArray } from "./utils"
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

class Plugin {
  public readonly original: string
  public readonly outputDir: string
  public readonly size: number[] | number
  public readonly format: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
  public readonly grayscale: boolean
  public readonly imgName: string
  public readonly log: boolean
  public logger: ReturnType<Compilation["getLogger"]>

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
    this.logger = compiler.getInfrastructureLogger("generate-icon-webpack-plugin")

    compiler.hooks.done.tap("generate-icon-webpack-plugin", (): void => {
      this.generate()
    })
  }

  private displayLog(): void | Table {
    if (this.log) {
      const table = new Table({
        head: ["format", "width", "height", "channels", "premultiplied", "size", "path"],
      })

      return table
    }
  }

  private async generate(): Promise<void> {
    try {
      await mkdirp(this.outputDir)
      const handleGenerate: Sharp = sharp(this.original)
      const table: void | Table = this.displayLog()

      if (this.grayscale) {
        handleGenerate.grayscale()
      }

      if (typeof this.size === "number") {
        try {
          handleLog({
            handleGenerate: handleGenerate,
            size: this.size,
            format: this.format,
            outputDir: this.outputDir,
            imgName: this.imgName,
            log: this.log,
            table: table,
          })
        } catch (err) {
          this.logger.error(err)
          throw err
        }
      }

      if (this.size instanceof Array && isNumArray(this.size)) {
        try {
          for (const size in this.size) {
            handleLog({
              handleGenerate: handleGenerate,
              size: this.size[size],
              format: this.format,
              outputDir: this.outputDir,
              imgName: this.imgName,
              log: this.log,
              table: table,
            })
          }
        } catch (err) {
          this.logger.error(err)
          throw err
        }
      }

      if (typeof table !== "undefined") {
        console.log(table.toString())
      }
    } catch (err) {
      this.logger.error(err)
      throw err
    }
  }
}

export default Plugin
