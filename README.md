PIXI-SVG-Graphics
====================

This module can draw SVG documents on PIXI.js's `Graphics` object, making them scaleable and crisp.

Usage:
------

Using as a module

```js
var svg = document.querySelector('svg#MySVGTag')
var SVGGraphics = require('pixi-svg-graphics')
var graphics = new PIXI.Graphics()
SVGGraphics.drawSVG(graphics, svg)
```

Or just include pixi-svg-graphics.min.js in your HTML:

```html
<script src="pixi-svg-graphics.min.js"></script>
```

The module is then available using `window.SVGGraphics`

Todos:
------

* Add font support
