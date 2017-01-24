Squarespace Layout: Autocolumns
-------------------------------

A module to lay out a group of elements in an autocolumns-style (i.e., masonry) grid.

*NOTICE: This code is licensed to you pursuant to Squarespace’s Developer Terms of Use. See license section below.*

## Usage

```sh
npm install --save @squarespace/layout-autocolumns;
```

```js
const Autocolumns = require('@squarespace/layout-autocolumns');

const grid = new Autocolumns(rootNode, {
  config
});
```

### Using ES6

If you prefer to handle transpiling and polyfilling on your own, you can import ES6 from Mercury:

```js
import Autocolumns from '@squarespace/layout-autocolumns/src';
```

Alternately, Autocolumns specifies a `module` property in `package.json` that points to the uncompiled `src/index.js`, so you may be able to simply import `@squarespace/layout-autocolumns` if you're using one of the following bundlers:
* [Webpack 2](https://webpack.js.org/configuration/resolve/#resolve-mainfields)
* [Rollup](https://github.com/rollup/rollup-plugin-node-resolve#rollup-plugin-node-resolve)

## Reference

### new Autocolumns(rootNode, {config})
**Params**
* rootNode `Node` - Wrapper around the whole grid (required)
* config `Object` - Config object
* config.childNodes `String` - Class name of the elements to be placed (required)
* [config.imageNodes] `String` - Class name of the parent wrapper around each image
* [config.gutter] `Number` - Space between each item (in pixels; default `5`)
* [config.minColumns] `Number` - Smallest number of columns the modules will create (default `1`)
* [config.maxColumns] `Number` - Largest number of columns the module will create (default `12`)
* [config.minColumnWidth] `Number` - Minimum width for each column (in pixels; default `300`)
* [config.afterChildLoaded] `Function` - Callback function run after each child is loaded
* [config.autoLoadImages] `Boolean` - Set to `true` for the module to handle image loading (default `false`)

### Autocolumns.layout(config)
Lays out the grid with existing parameters. Can also pass new parameters when called.

### Autocolumns.afterResize()
Function to call after resize event. Calls `Autocolumns.reset()` then `Autocolumns.layout()`.

### Autocolumns.reset()
Resets styles on all children.

### Autocolumns.destroy()
Resets styles on wrapper and all children and removes the module classes.

## License
Portions Copyright © 2016 Squarespace, Inc. This code is licensed to you pursuant to Squarespace’s Developer Terms of Use, available at http://developers.squarespace.com/developer-terms-of-use (the “Developer Terms”). You may only use this code on websites hosted by Squarespace, and in compliance with the Developer Terms. TO THE FULLEST EXTENT PERMITTED BY LAW, SQUARESPACE PROVIDES ITS CODE TO YOU ON AN “AS IS” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.