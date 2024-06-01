const path = require("path")
const GenerateIconWebpackPlugin = require("generate-icon-webpack-plugin")

module.exports = {
  mode: "development",
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
  devServer: {
    static: path.resolve(__dirname, "dist"),
    compress: true,
    port: 9000,
    open: true,
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  plugins: [
    new GenerateIconWebpackPlugin({
      logo: path.resolve(__dirname, "icon.png"),
      dir: "icons",
      size: [16, 32, 48, 64, 128],
      formart: "png",
      grayscale: true,
      imgName: "icon",
      log: true,
    })
  ]
}