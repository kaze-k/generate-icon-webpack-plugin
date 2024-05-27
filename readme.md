# generate-icon-webpack-plugin

A webpack plugin to generate icons of different sizes

## Usage

add the plugin:

``` js
yarn add generate-icon-webpack-plugin -D
```

configure the plugin:

``` js
new CrxPackWebpackPlugin({
  original: path.resolve(__dirname, "./icon.png"),
  output: "icons",
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
| original | yes | string | none | images that need to be converted |
| output | no | string | "icons" | the directory for the output picture |
| size | yes | number[]/number | [16, 32, 48, 64, 128] | image size, if it is a number, only one image is generated, if it is an array, it is multiple images |
| format | no | string | "png" | the format of the output picture |
| grayscale | no | boolean | false | whether to generate a gray image |
| imgName | no | string | "icon" | name of the picture |
| log | no | boolean | false | print picture information |

## Acknowledgement

Inspired by [plasmo](https://github.com/PlasmoHQ/plasmo)'s ability to generate images.
