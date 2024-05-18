import Table from "cli-table"
import sharp, { FormatEnum, OutputInfo } from "sharp"

async function sharp_resolver(
  file: string,
  size: number,
  format: keyof FormatEnum,
  grayscale: boolean,
): Promise<{
  data: Buffer
  info: OutputInfo
}> {
  const { data, info } = await sharp(file)
    .resize(size)
    .toFormat(format)
    .grayscale(grayscale)
    .toBuffer({ resolveWithObject: true })

  return { data, info }
}

function setTable(data: string[][]): string {
  const table = new Table({
    head: ["format", "width", "height", "channels", "premultiplied", "size"],
    style: {
      head: ["green"],
    },
  })
  table.push(...data)
  return table.toString()
}

export { sharp_resolver, setTable }
