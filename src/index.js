import TemplateLayout from '@squarespace/layout-base';
import { ImageLoader } from '@squarespace/core';

const MODULE_CLASSES = {
  rootNode: 'autocolumns-wrapper',
  childNodes: 'autocolumns-item-wrapper',
  imageNodes: 'autocolumns-image-wrapper'
};

const MODULE_DEFAULTS = {
  minColumns: 1,
  maxColumns: 12,
  minColumnWidth: 300,
  gutter: 5,
  autoLoadImages: false
};


class Autocolumns extends TemplateLayout {
  constructor(rootNode, config = {}) {
    super(rootNode, Object.assign({}, MODULE_DEFAULTS, config));

    this.rootNode.classList.add(MODULE_CLASSES.rootNode);

    this.childNodes.forEach(node => {
      node.classList.add(MODULE_CLASSES.childNodes);

      const imageWrapper = node.querySelector(this.config.imageWrapperSelector);
      if (imageWrapper) {
        imageWrapper.classList.add(MODULE_CLASSES.imageNodes);
      }
    });
  }

  /**
   * Gets the aspect ratio of an image.
   *
   * @param {DOMNode} img image node
   * @method getImageRatio
   * @return {Integer} (height/width) * 100
   *                   1 = square
   *                   < 1 = landscape
   *                   > 1 = portrait
   */
  getImageRatio(img) {
    // this conditional is a hack to get around the fact that system placeholder
    // images get their data-image-dimensions attr set late
    if (img.getAttribute('data-image-dimensions') !== '') {
      const [ x, y ] = img.getAttribute('data-image-dimensions').split('x').map(dim => parseFloat(dim, 10));
      return y / x;
    }
    return 1;
  }

  /**
   * Set an intrinsic padding on image wrapper.
   *
   * @param {DOMNode} imgWrapper image node
   * @method setIntrinsicPadding
   */
  setIntrinsicPadding(imgWrapper) {
    const imgRatio = this.getImageRatio(imgWrapper.querySelector('img'));
    imgWrapper.style.paddingBottom = Math.floor(imgRatio * 100) + '%';
  }

  /**
   * Load item image using ImageLoader
   *
   * @param {DOMNode} img image node
   */
  loadImage(img) {
    ImageLoader.load(img, {
      mode: 'none',
      load: true
    });
  }

  /**
   * Calculate the number of columns in the grid
   *
   * @method getNumberOfColumns
   * @param {number} wrapperWidth width of containing wrapper
   * @return {Integer}
   */
  getNumberOfColumns(wrapperWidth) {
    // first divide available width by minColumnWidth setting
    const availableWidth = wrapperWidth + this.config.gutter;
    const minColumnPlusGutter = this.config.minColumnWidth + this.config.gutter;
    let calculatedCols = Math.floor(availableWidth / minColumnPlusGutter);
    // then, get the min of columns that fit vs. the max number of columns specified...
    calculatedCols = Math.min(calculatedCols, this.config.maxColumns);
    // then get the max of that and the min number of columns specified...
    calculatedCols = Math.max(calculatedCols, this.config.minColumns);
    // then make sure you don't end up with 0 columns.
    return Math.max(calculatedCols, 1);
  }

  /**
   * Calculate the width of the columns in the grid
   *
   * @param {Integer} cols
   * @method getFinalColumnWidth
   * @return {Integer}
   */
  getFinalColumnWidth(wrapperWidth, cols) {
    return (wrapperWidth - ((cols - 1) * this.config.gutter)) / cols;
  }

  /**
   * Positions child node at x/y coordinates
   *
   * @param {DOMNode} el child node to place
   * @param {number} x left position
   * @param {number} y top position
   */
  placeitem(el, x, y) {
    el.style.top = y + 'px';
    el.style.left = x + 'px';
  }

  /**
   * After a child node is placed, run a callback if one is provided.
   *
   * @method afterChildLoaded
   * @param {DOMNode} item child node
   */
  afterChildLoaded(item) {
    if (typeof this.config.afterChildLoaded === 'function') {
      this.config.afterChildLoaded(item);
    }
  }

  /**
   * Main layout logic
   *
   * @param {Object} config updated configuration options
   */
  layout(config = {}) {
    this.beforeLayout(config);

    const wrapperWidth = this.rootNode.offsetWidth;
    const numCols = this.getNumberOfColumns(wrapperWidth);
    const colWidth = this.getFinalColumnWidth(wrapperWidth, numCols);

    let wrapperHeight = 0;
    let leftPos = 0;
    let topPos = 0;
    let coords = [];

    this.childNodes.forEach((item, index) => {
      const img = item.querySelector('img[data-src]');

      let itemTop;
      let itemHeight;

      // set the width on the item
      item.style.width = colWidth + 'px';

      // if there's an image, set up its wrapper and load it
      if (img) {
        img.removeAttribute('data-load');
        this.setIntrinsicPadding(item.querySelector('.' + MODULE_CLASSES.imageNodes));

        if (this.config.autoLoadImages) {
          this.loadImage(img);
        }
      }

      // first row
      if (index < numCols) {
        this.placeitem(item, leftPos, topPos);
        // coords will be an array of arrays, tracking the left/top
        // coordinate of the current bottom of each row
        itemTop = item.offsetTop;
        itemHeight = item.offsetHeight;
        coords.push([leftPos, itemTop + itemHeight]);
        leftPos += colWidth + this.config.gutter;
      // now fill in gaps
      } else {
        // sort the coords array so that the shortest column is always first
        coords.sort((a, b) => a[1] - b[1]);

        // set the position to the first array in the sorted coords array
        topPos = coords[0][1] + this.config.gutter;
        leftPos = coords[0][0];

        this.placeitem(item, leftPos, topPos);

        // clip off the array you just used and add the new left/bottom of the
        // current column to the array
        coords.splice(0, 1);
        itemTop = item.offsetTop;
        itemHeight = item.offsetHeight;
        coords.push([leftPos, itemTop + itemHeight]);
      }

      // run the onItemLoad callback if provided
      this.afterChildLoaded(item);

      // set the height of the wrapper to the max of the last item's
      // bottom or the current wrapper height
      wrapperHeight = Math.max(wrapperHeight, itemTop + itemHeight);
    });

    // - set the height of the wrapper
    // - run onLoad callback
    this.rootNode.style.height = wrapperHeight + 'px';
    this.afterLayout();
  }

  /**
   * Resets CSS of children
   */
  reset() {
    this.childNodes.forEach((item) => {
      const imgWrapper = item.querySelector('.' + MODULE_CLASSES.imageNodes);
      if (imgWrapper) {
        imgWrapper.style.paddingBottom = '';
      }

      item.style.top = '';
      item.style.left = '';
      item.style.width = '';
    });
  }

  /**
   * Functionality to run after resize event
   */
  afterResize() {
    this.reset();
    this.layout();
  }

  /**
   * Teardown module
   */
  destroy() {
    this.beforeDestroy();
    this.reset();

    this.rootNode.style.height = '';
    if (this.config.rootNode !== MODULE_CLASSES.rootNode) {
      this.rootNode.classList.remove(MODULE_CLASSES.rootNode);
    }
    this.childNodes.forEach((item) => {
      if (this.config.childNodes !== MODULE_CLASSES.childNodes) {
        item.classList.remove(MODULE_CLASSES.childNodes);
      }
      const imageNode = item.querySelector('.' + MODULE_CLASSES.imageNodes);
      if (imageNode && this.config.imageNodes !== MODULE_CLASSES.imageNodes) {
        imageNode.classList.remove(MODULE_CLASSES.imageNodes);
      }
    });

    this.afterDestroy();
  }
}

export default Autocolumns;
