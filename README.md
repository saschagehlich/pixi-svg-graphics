<a href="https://travis-ci.org/GreyRook/pixi-svg-graphics"><img src="https://travis-ci.org/GreyRook/pixi-svg-graphics.svg?branch=master" align=right></a>

PIXI-SVG-Graphics
====================

This module can draw SVG documents on PIXI.js's `Graphics` object, making them scaleable and crisp.  The code originates from [saschagehlich/pixi-svg-graphics](https://github.com/saschagehlich/pixi-svg-graphics) but is API wise incompatible and refactored quite a bit.

Usage:
------

Using as a module

```js
var svg = document.querySelector('svg#MySVGTag')
var SVGGraphics = require('pixi-svg-graphics')
var graphics = new SVGGraphics(svg);
```

Or just include pixi-svg-graphics.min.js in your HTML:

```html
<script src="pixi-svg-graphics.min.js"></script>
```

The module is then available using `window.SVGGraphics`

Supported Tags:
------

- &lt;svg>
- &lt;style>
- &lt;g>
- &lt;text>
- &lt;line>
- &lt;polyline>
- &lt;circle>
- &lt;ellipse>
- &lt;rect> (no rounded corners supported)
- &lt;polygon>
- &lt;path> (points that are too close together, like less than 1 pixel until a few pixels, can lead to graphic errors)

Supported Attributes:
------

- class
- style
- fill
- stroke
- stroke-width
- stroke-dasharray
- vector-effect
- transform:
  - matrix
  - translate
  - scale
  - rotate
  - not supported: skewX, skewY
- d (&lt;path> only):
  - M (move to)
  - L (line to)
  - C (curve to)
  - V (vertical line to)
  - H (horizontal line to)
  - S (bezier curve to)
  - Z (close path)

Test:
-----

In order to test the library you need a browserstack account and have inkscape
installed.  First create a '.browserstack.json' in your home folder. Fill it
with your credentials.  Then you can run 'run_tests.py'. This will automatically
start an nginx server, convert all test images inside 'test/src' to png's using
inkscape and will then compare these png's with png's, which are created
through browserstack. Afterwards it will run an image comparison tool.

Todos:
------

* Add font formating support
