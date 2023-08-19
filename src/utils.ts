import Table from "cli-table"
import sharp, { OutputInfo } from "sharp"

interface Options {
  handleGenerate: sharp.Sharp
  size: number
  format: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
  outputDir: string
  imgName: string
  log: boolean
  table: void | Table
}

function isNumArray(x: unknown): boolean {
  if (x instanceof Array) {
    return x.length > 0 && x.every((value: undefined): boolean => typeof value === "number")
  }

  return false
}

async function handleLog(options: Options) {
  const data: OutputInfo = await options.handleGenerate
    .resize(options.size)
    .toFormat(options.format)
    .toFile(`${options.outputDir}/${options.imgName}${options.size}.${options.format}`)

  if (options.log) {
    options.table?.push([
      data["format"],
      String(data["width"]),
      String(data["height"]),
      String(data["channels"]),
      String(data["premultiplied"]),
      String(data["size"]),
      `${options.outputDir}/${options.imgName}${options.size}.${options.format}`,
    ])
  }
}

export { isNumArray, handleLog }
