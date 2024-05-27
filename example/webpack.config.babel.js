import path from "path"
import GenerateIconWebpackPlugin from "generate-icon-webpack-plugin"

export default {
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  cache: {
    type: "filesystem",
    allowCollectingMemory: true,
  },
  infrastructureLogging: {
    debug: true,
  },
  mode: "development",
  plugins: [
    new GenerateIconWebpackPlugin({
      original: path.resolve(__dirname, "icon.png"),
      output: "icons",
      size: [16, 32, 48, 64, 128],
      format: "png",
      grayscale: true,
      imgName: "icon",
      log: true,
    })
  ]
}
