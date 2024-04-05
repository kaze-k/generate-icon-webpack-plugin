import { OutputInfo, Sharp } from "sharp"

interface Options {
  generator: Sharp
  size: number
  format: "avif" | "gif" | "heif" | "jpeg" | "jp2" | "jxl" | "png" | "tiff" | "webp"
}

interface SharpReturn {
  buffer: Buffer
  info: OutputInfo
}

function isNumArray(x: unknown): boolean {
  if (x instanceof Array) {
    return x.length > 0 && x.every((value: undefined): boolean => typeof value === "number")
  }

  return false
}

function handleSharp(options: Options): Promise<SharpReturn> {
  return new Promise(
    (resolve: (value: SharpReturn | PromiseLike<SharpReturn>) => void, reject: (reason?: Error) => void): void => {
      options.generator
        .resize(options.size)
        .toFormat(options.format)
        .toBuffer((err: Error, buffer: Buffer, info: OutputInfo): void => {
          if (err) {
            reject(err)
          }

          resolve({
            buffer: buffer,
            info: info,
          })
        })
    },
  )
}

export { isNumArray, handleSharp, type SharpReturn }
