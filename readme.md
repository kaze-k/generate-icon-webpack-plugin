# generate-icon-webpack-plugin

A webpack plugin to generate icons of different sizes

Images in the `icons` field and `action.default_icon` field in chrome extensions **Manifest V3** can be generated using this plugin

## Usage

add the plugin:

``` bash
npm install generate-icon-webpack-plugin --save-dev
// or
pnpm add generate-icon-webpack-plugin -D
// or
yarn add generate-icon-webpack-plugin -D
```

configure the plugin:

``` js
new CrxPackWebpackPlugin({
  logo: path.resolve(__dirname, "./icon.png"),
  dir: "icons",
  size: [128, 64, 48, 32, 16], // 128, It can be an array or a number
  format: "png",
  grayscale: false,
  imgName: "icon",
  log: true
})
```

## Configuration Settings

| Option | Required | Type | Default | About |
|---|---|---|---|---|
| logo | yes | string | none | images that need to be converted |
| dir | no | string | "icons" | the directory for the output picture |
| size | no | number[]/number | [16, 32, 48, 64, 128] | image size, if it is a number, only one image is generated, if it is an array, it is multiple images |
| format | no | string | "png" | the format of the output picture |
| grayscale | no | boolean | false | whether to generate a gray image |
| imgName | no | string | "icon" | name of the picture |
| log | no | boolean | false | print picture information |

## Acknowledgement

Inspired by [plasmo](https://github.com/PlasmoHQ/plasmo)'s ability to generate images.
