import Table from "cli-table"
import Jimp from "jimp"

type Format = "bmp" | "gif" | "png" | "jpeg" | "tiff"

interface Bitmap {
  data: Buffer
  width: number
  height: number
  depth: number
  interlace: boolean
  palette: boolean
  color: boolean
  alpha: boolean
  bpp: number
  colorType: number
  gamma: number
}

async function jimp_resolver(
  file: string,
  size: number,
  format: Format,
  grayscale: boolean,
): Promise<{
  data: Buffer
  info: Bitmap
}> {
  const image: Jimp = await Jimp.read(file)

  if (grayscale) image.greyscale()

  image.resize(size, size)

  let mine:
    | typeof Jimp.MIME_PNG
    | typeof Jimp.MIME_JPEG
    | typeof Jimp.MIME_GIF
    | typeof Jimp.MIME_BMP
    | typeof Jimp.MIME_TIFF = Jimp.MIME_PNG
  if (format === "png") mine = Jimp.MIME_PNG
  else if (format === "jpeg") mine = Jimp.MIME_JPEG
  else if (format === "gif") mine = Jimp.MIME_GIF
  else if (format === "bmp") mine = Jimp.MIME_BMP
  else if (format === "tiff") mine = Jimp.MIME_TIFF

  const data: Buffer = await image.getBufferAsync(mine)

  return {
    data: data,
    info: image.bitmap as Bitmap,
  }
}

function setTable(data: string[][]): string {
  const table = new Table({
    head: ["width", "height", "depth", "alpha", "color", "colorType", "bpp", "interlace", "palette", "gamma", "size"],
    style: {
      head: ["green"],
    },
  })
  table.push(...data)
  return table.toString()
}

export { jimp_resolver, setTable }

export type { Bitmap, Format }
