(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("pixi.js"));
	else if(typeof define === 'function' && define.amd)
		define(["pixi.js"], factory);
	else if(typeof exports === 'object')
		exports["SVGGraphics"] = factory(require("pixi.js"));
	else
		root["SVGGraphics"] = factory(root["PIXI"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var PIXI = __webpack_require__(1)
	var color2color = __webpack_require__(2)

	function SVGGraphics (graphics) {
	  this._graphics = graphics
	}

	/**
	 * Draws the given node
	 * @param  {SVGElement} node
	 */
	SVGGraphics.prototype.drawNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  var tagName = node.tagName
	  var capitalizedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
	  this.applyTransformation(node, graphics)
	  if (!this['draw' + capitalizedTagName + 'Node']) {
	    console.warn('No drawing behavior for ' + capitalizedTagName + ' node')
	  } else {
	    graphics.addChild(this['draw' + capitalizedTagName + 'Node'](node))
	  }
	  return graphics
	}

	/**
	 * Draws the given root SVG node (and handles it as a group)
	 * @param  {SVGSVGElement} node
	 */
	SVGGraphics.prototype.drawSvgNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  return graphics.addChild(this.drawGNode(node))
	}

	/**
	 * Draws the given group svg node
	 * @param  {SVGGroupElement} node
	 */
	SVGGraphics.prototype.drawGNode = function (node) {
	  var children = node.children || node.childNodes
	  var child
	  var graphics = new PIXI.Graphics()
	  for (var i = 0, len = children.length; i < len; i++) {
	    child = children[i]
	    if (child.nodeType !== 1) { continue }
	    graphics.addChild(this.drawNode(child))
	  }
	  return graphics
	}

	/**
	 * Draws tje text svg node
	 * @param {SVGTextElement} node
	 */
	SVGGraphics.prototype.drawTextNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  var styles = node.getAttribute('style').split(";")
	  var styles_obj = {}
	  for(var i = 0; i < styles.length; i++) {
	    var splitted_style = styles[i].split(':')
	    var key = splitted_style[0]
	    var val = splitted_style[1]
	    styles_obj[key] = val
	  }
	  var font = styles_obj['font-size'] + " " + styles_obj['font-family']
	  var fill = styles_obj['fill']
	  var tspan = node.childNodes[0]
	  var text = tspan.innerHTML
	  var pixi_text = new PIXI.Text(text, {font: font, fill: fill})
	  pixi_text.x = node.getAttribute('x')
	  pixi_text.y = node.getAttribute('y')
	  return graphics.addChild(pixi_text)
	}

	/**
	 * Draws the given line svg node
	 * @param  {SVGLineElement} node
	 */
	SVGGraphics.prototype.drawLineNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)

	  var x1 = parseScientific(node.getAttribute('x1'))
	  var y1 = parseScientific(node.getAttribute('y1'))
	  var x2 = parseScientific(node.getAttribute('x2'))
	  var y2 = parseScientific(node.getAttribute('y2'))

	  graphics.moveTo(x1, y1)
	  graphics.lineTo(x2, y2)

	  return graphics
	}

	/**
	 * Draws the given polyline svg node
	 * @param  {SVGPolylineElement} node
	 */
	SVGGraphics.prototype.drawPolylineNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)

	  var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)'
	  var points = node.getAttribute('points').match(new RegExp(reg, 'g'))

	  var point
	  for (var i = 0, len = points.length; i < len; i++) {
	    point = points[i]
	    var coords = point.match(new RegExp(reg))

	    coords[1] = parseScientific(coords[1])
	    coords[2] = parseScientific(coords[2])

	    if (i === 0) {
	      graphics.moveTo(coords[1], coords[2])
	    } else {
	      graphics.lineTo(coords[1], coords[2])
	    }
	  }
	  return graphics
	}

	/**
	 * Draws the given circle node
	 * @param  {SVGCircleElement} node
	 */
	SVGGraphics.prototype.drawCircleNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)

	  var cx = parseScientific(node.getAttribute('cx'))
	  var cy = parseScientific(node.getAttribute('cy'))
	  var r = parseScientific(node.getAttribute('r'))

	  graphics.drawCircle(cx, cy, r)
	  return graphics
	}

	/**
	 * Draws the given ellipse node
	 * @param  {SVGCircleElement} node
	 */
	SVGGraphics.prototype.drawEllipseNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)

	  var cx = parseScientific(node.getAttribute('cx'))
	  var cy = parseScientific(node.getAttribute('cy'))
	  var rx = parseScientific(node.getAttribute('rx'))
	  var ry = parseScientific(node.getAttribute('ry'))

	  graphics.drawEllipse(cx, cy, rx, ry)
	  return graphics
	}

	/**
	 * Draws the given rect node
	 * @param  {SVGRectElement} node
	 */
	SVGGraphics.prototype.drawRectNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)

	  var x = parseScientific(node.getAttribute('x'))
	  var y = parseScientific(node.getAttribute('y'))
	  var width = parseScientific(node.getAttribute('width'))
	  var height = parseScientific(node.getAttribute('height'))

	  graphics.drawRect(x, y, width, height)
	  return graphics
	}

	/**
	 * Draws the given polygon node
	 * @param  {SVGPolygonElement} node
	 */
	SVGGraphics.prototype.drawPolygonNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)'
	  var points = node.getAttribute('points').match(new RegExp(reg, 'g'))

	  var path = []
	  var point
	  for (var i = 0, len = points.length; i < len; i++) {
	    point = points[i]
	    var coords = point.match(new RegExp(reg))

	    coords[1] = parseScientific(coords[1])
	    coords[2] = parseScientific(coords[2])

	    path.push(new PIXI.Point(
	      coords[1],
	      coords[2]
	    ))
	  }

	  this.applySvgAttributes(node, graphics)
	  graphics.drawPolygon(path)
	  return graphics
	}

	/**
	 * Draws the given path svg node
	 * @param  {SVGPathElement} node
	 */
	SVGGraphics.prototype.drawPathNode = function (node) {
	  var graphics = new PIXI.Graphics()
	  this.applySvgAttributes(node, graphics)
	  var d = node.getAttribute('d').trim()
	  var data = this.tokenizePathData(d)
	  return this.drawPathData(data,graphics)
	}

	/**
	 * Draw the given tokenized path data object
	 */
	SVGGraphics.prototype.drawPathData = function (data, graphics) {
	  var instructions = data.instructions
	  var lastControl
	  var subpathIndex = 0

	  for (var i = 0; i < instructions.length; i++) {
	    var command = instructions[i].command
	    var args = instructions[i].args
	    var points = instructions[i].points
	    var z = 0
	    var fill = true
	    while (z < points.length) {
	      switch (command.toLowerCase()) {
	        // moveto command
	        case 'm':
	          var x = points[z].x
	          var y = points[z].y

	          //check if we need to create "holes"
	          var direction = lastDirection = data.subpaths[subpathIndex].direction
	          if(subpathIndex > 0) {
	            lastDirection = data.subpaths[subpathIndex-1].direction
	            if(direction != lastDirection) {
	              fill = false
	            }
	          }

	          if (z == 0 && fill) {
	            graphics.moveTo(x, y)
	            graphics.graphicsData[graphics.graphicsData.length-1].shape.closed = false
	          } else {
	            graphics.lineTo(x, y)
	          }
	          z += 1
	          break
	        // lineto command
	        case 'l':
	          var x = points[z].x
	          var y = points[z].y

	          graphics.lineTo(x, y)
	          z += 1
	          break
	        // curveto command
	        case 'c':
	          graphics.bezierCurveTo(
	            points[z].x,
	            points[z].y,
	            points[z + 1].x,
	            points[z + 1].y,
	            points[z + 2].x,
	            points[z + 2].y
	          )
	          lastControl = points[z + 1]
	          z += 3
	          break
	        // vertial lineto command
	        case 'v':
	          var x = points[z].x
	          var y = points[z].y

	          graphics.lineTo(x, y)
	          lastCoord.y = y
	          z += 1
	          break
	        // horizontal lineto command
	        case 'h':
	          var x = points[z].x
	          var y = points[z].y

	          graphics.lineTo(x, y)
	          z += 1
	          break
	        // quadratic curve command
	        case 's':
	          for (var l = 0; l < 2; l++) {
	            points[l + z].x
	            points[l + z].y
	          }

	          var rx = 2 * points[z-1].x - lastControl.x
	          var ry = 2 * points[z-1].y - lastControl.y

	          graphics.bezierCurveTo(
	            rx,
	            ry,
	            points[z],
	            points[z],
	            points[z + 1],
	            points[z + 1]
	          )
	          lastControl = points[z]
	          z += 2
	          break
	        // closepath command
	        case 'z':
	          z += 1
	          subpathIndex += 1
	          graphics.graphicsData[graphics.graphicsData.length-1].shape.closed = true
	          // Z command is handled by M
	          break
	        default:
	          throw new Error('Could not handle path command: ' + commandType + ' ' + args.join(','))
	      }
	    }
	  }
	  return graphics
	}

	SVGGraphics.prototype.tokenizePathData = function(pathData) {
	  var commands = pathData.match(/[a-df-z][^a-df-z]*/ig)
	  var data = {
	    instructions: [],
	    subpaths: []
	  }

	  //needed to calculate absolute position of points
	  var lastPoint = {
	    x: 0,
	    y: 0
	  }
	  var subpaths = []
	  var subpath = {
	    points: []
	  }
	  for(var i = 0; i < commands.length; i++) {
	    var instruction = {
	      points: []
	    }
	    var command = commands[i][0]
	    var args = []

	    //allow any decimal number in normal or scientific form
	    args = args.concat(commands[i].slice(1).trim().match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g))
	    var p = 0
	    while(p < args.length) {
	      var offset = {
	        x: 0,
	        y: 0
	      }
	      if (command === command.toLowerCase()) {
	        // Relative positions
	        offset = lastPoint
	      }
	      var points = []
	      switch(command.toLowerCase()) {
	        case 'm':
	          var point = {}
	          point.x = parseScientific(args[p]) + offset.x
	          point.y = parseScientific(args[p+1]) + offset.y
	          points.push(point)
	          lastPoint = point
	          subpath.points.push(lastPoint)
	          p += 2
	          break
	        case 'l':
	          var point = {}
	          point.x = parseScientific(args[p]) + offset.x
	          point.y = parseScientific(args[p+1]) + offset.y
	          points.push(point)
	          lastPoint = point
	          subpath.points.push(lastPoint)
	          p += 2
	          break
	        case 'c':
	          var point1 = {} , point2 = {} , point3 = {}
	          point1.x = parseScientific(args[p]) + offset.x
	          point1.y = parseScientific(args[p+1]) + offset.y
	          point2.x = parseScientific(args[p+2]) + offset.x
	          point2.y = parseScientific(args[p+3]) + offset.y
	          point3.x = parseScientific(args[p+4]) + offset.x
	          point3.y = parseScientific(args[p+5]) + offset.y
	          points.push(point1)
	          points.push(point2)
	          points.push(point3)
	          lastPoint = point3
	          subpath.points.push(lastPoint)
	          p += 6
	          break
	        case 'v':
	          var point = {}
	          point.y = parseScientific(args[p]) + offset.y
	          point.x = lastPoint.x
	          points.push(point)
	          lastPoint = point
	          subpath.points.push(lastPoint)
	          p += 1
	          break
	        case 'h':
	          var point = {}
	          point.x = parseScientific(args[p]) + offset.x
	          point.y = lastPoint.y
	          points.push(point)
	          lastPoint = point
	          subpath.points.push(lastPoint)
	          p += 1
	          break
	        case 's':
	          var point1 = {} , point2 = {}
	          point1.x = parseScientific(args[p]) + offset.x
	          point1.y = parseScientific(args[p+1]) + offset.y
	          point2.x = parseScientific(args[p+2]) + offset.x
	          point2.y = parseScientific(args[p+3]) + offset.y
	          points.push(point1)
	          points.push(point2)
	          lastPoint = point2
	          subpath.points.push(lastPoint)
	          p += 4
	          break
	        case 'z':
	          points.push({x:0,y:0})
	          //subpath is closed so we need to push the subpath
	          subpath.direction = this.getPathDirection(subpath)
	          subpaths.push(subpath)
	          subpath = {
	            points: []
	          }
	          p += 1
	          break
	      }
	      instruction.points = instruction.points.concat(points)
	    }
	    instruction.command = command
	    data.instructions.push(instruction)
	  }

	  //If path data ends with no z command, then we need to push the last subpath
	  if(subpath.points.length > 0) {
	    subpath.direction = this.getPathDirection(subpath)
	    subpaths.push(subpath)
	  }
	  data.subpaths = subpaths
	  return data
	}

	SVGGraphics.prototype.getPathDirection = function(path) {
	  //based on http://stackoverflow.com/a/1584377
	  var points = path.points
	  var sum = 0
	  for(var i = 0; i < points.length - 1; i++) {
	    var curPoint = points[i]
	    var nexPoint = points[(i+1)]
	    sum += (nexPoint.x - curPoint.x)*(nexPoint.y - curPoint.y)
	  }
	  if(sum > 0) {
	    //clockwise
	    return 'cw'
	  } else {
	    //counter-clockwise
	    return 'ccw'
	  }
	}

	SVGGraphics.prototype.applyTransformation = function (node, graphics) {
	  if (node.getAttribute('transform')) {
	    var transformMatrix = new PIXI.Matrix()
	    var transformAttr = node.getAttribute('transform').trim().split('(')
	    var transformCommand = transformAttr[0]
	    var transformValues = transformAttr[1].replace(')','').split(',')
	    if(transformCommand == 'matrix') {
	      transformMatrix.a   = parseScientific(transformValues[0])
	      transformMatrix.b   = parseScientific(transformValues[1])
	      transformMatrix.c   = parseScientific(transformValues[2])
	      transformMatrix.d   = parseScientific(transformValues[3])
	      transformMatrix.tx  = parseScientific(transformValues[4])
	      transformMatrix.ty  = parseScientific(transformValues[5])
	      var point = {x: 0, y: 0}
	      var trans_point = transformMatrix.apply(point)
	      graphics.x += trans_point.x
	      graphics.y += trans_point.y
	      graphics.scale.x = Math.sqrt(transformMatrix.a * transformMatrix.a + transformMatrix.b * transformMatrix.b)
	      graphics.scale.y = Math.sqrt(transformMatrix.c * transformMatrix.c + transformMatrix.d * transformMatrix.d)

	      graphics.rotation = -Math.acos(transformMatrix.a/graphics.scale.x)
	    } else if(transformCommand == 'translate') {
	      graphics.x += parseScientific(transformValues[0])
	      graphics.y += parseScientific(transformValues[1])
	    } else if(transformCommand == 'scale') {
	      graphics.scale.x = parseScientific(transformValues[0])
	      graphics.scale.y = parseScientific(transformValues[1])
	    } else if(transformCommand == 'rotate') {
	      if(transformValues.length > 1) {
	        graphics.x += parseScientific(transformValues[1])
	        graphics.y += parseScientific(transformValues[2])
	      }

	      graphics.rotation = parseScientific(transformValues[0])

	      if(transformValues.length > 1) {
	        graphics.x -= parseScientific(transformValues[1])
	        graphics.y -= parseScientific(transformValues[2])
	      }
	    }
	  }
	}

	/**
	 * Applies the given node's attributes to our PIXI.Graphics object
	 * @param  {SVGElement} node
	 */
	SVGGraphics.prototype.applySvgAttributes = function (node, graphics) {
	  var attributes = {}

	  // Get node attributes
	  var i = node.attributes.length
	  var attribute
	  while (i--) {
	    attribute = node.attributes[i]
	    attributes[attribute.name] = attribute.value
	  }

	  // CSS attributes override node attributes
	  var style = node.getAttribute('style')
	  var pairs, pair, split, key, value
	  if (style) {
	    // Simply parse the inline css
	    pairs = style.split(';')
	    for (var j = 0, len = pairs.length; j < len; j++) {
	      pair = pairs[j].trim()
	      if (!pair) {
	        continue
	      }

	      split = pair.split(':', 2)
	      key = split[0].trim()
	      value = split[1].trim()
	      attributes[key] = value
	    }
	  }

	  // Apply stroke style
	  var strokeColor = 0x000000, strokeWidth = 1, strokeAlpha = 0

	  var color, intColor
	  if (attributes.stroke) {
	    color = color2color(attributes.stroke, 'array')
	    intColor = 256 * 256 * color[0] + 256 * color[1] + color[2]
	    strokeColor = intColor
	    strokeAlpha = color[3]
	  }

	  if (attributes['stroke-width']) {
	    strokeWidth = parseInt(attributes['stroke-width'], 10)
	  }
	  graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha)

	  // Apply fill style
	  var fillColor = 0x000000, fillAlpha = 0
	  if (attributes.fill) {
	    color = color2color(attributes.fill, 'array')
	    intColor = 256 * 256 * color[0] + 256 * color[1] + color[2]
	    fillColor = intColor
	    fillAlpha = color[3]

	    graphics.beginFill(fillColor, fillAlpha)
	  }
	}

	/**
	 * Builds a PIXI.Graphics object from the given SVG document
	 * @param  {PIXI.Graphics} graphics
	 * @param  {SVGDocument} svg
	 */
	SVGGraphics.drawSVG = function (graphics, svg) {
	  var svgGraphics = new SVGGraphics(graphics)

	  var children = svg.children || svg.childNodes
	  for (var i = 0, len = children.length; i < len; i++) {
	    if (children[i].nodeType !== 1) { continue }
	    svgGraphics._graphics.addChild(svgGraphics.drawNode(children[i]))
	  }
	}

	var parseScientific = function(numberString) {
	  var info = /([\d\.]+)e-(\d+)/i.exec(numberString)
	  if(!info) {
	    return parseFloat(numberString)
	  }

	  var num = info[1].replace('.',''), numDecs = info[2] - 1
	  var output = "0."
	  for (var i = 0; i < numDecs; i++) {
	    output += "0"
	  }
	  output += num
	  return parseFloat(output)
	}

	module.exports = SVGGraphics;


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	/*!
	 color2color v0.2.1 indyarmy.com
	 by Russ Porosky
	 IndyArmy Network, Inc.
	 */

	"use strict";
	var color2color = (function () {
	  var color2color = function (color, newColor, calculateOpacity) {
	    if (!newColor) {
	      newColor = "rgba";
	    }

	    color = color.toLowerCase();
	    newColor = newColor.toLowerCase();

	    var namedColor = getNamedColor(color),
	      colorDefs = [
	        {
	          re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
	          example: [ "rgb(123, 234, 45)", "rgb(255,234,245)" ],
	          process: function (bits) {
	            return [
	              parseInt(bits[ 1 ], 10), parseInt(bits[ 2 ], 10), parseInt(bits[ 3 ], 10), 1
	            ];
	          }
	        },
	        {
	          re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
	          example: [ "rgba(123, 234, 45, 1)", "rgba(255,234,245, 0.5)" ],
	          process: function (bits) {
	            return [
	              parseInt(bits[ 1 ], 10), parseInt(bits[ 2 ], 10), parseInt(bits[ 3 ], 10), parseFloat(bits[ 4 ])
	            ];
	          }
	        },
	        {
	          re: /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
	          example: [ "hsl(120, 100%, 25%)", "hsl(0, 100%, 50%)" ],
	          process: function (bits) {
	            bits[ 4 ] = 1;
	            var rgba = hslToRgb(bits);
	            return [
	              rgba.r, rgba.g, rgba.b, rgba.a
	            ];
	          }
	        },
	        {
	          re: /^hsla\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%,\s*(\d+(?:\.\d+)?|\.\d+)\s*\)/,
	          example: [ "hsla(120, 100%, 25%, 1)", "hsla(0, 100%, 50%, 0.5)" ],
	          process: function (bits) {
	            var rgba = hslToRgb(bits);
	            return [
	              rgba.r, rgba.g, rgba.b, rgba.a
	            ];
	          }
	        },
	        {
	          re: /^hsv\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/,
	          example: [ "hsv(120, 100%, 25%)", "hsl(0, 100%, 50%)" ],
	          process: function (bits) {
	            var rgb = hsvToRgb(bits);
	            return [
	              rgb.r, rgb.g, rgb.b, 1
	            ];
	          }
	        },
	        {
	          re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
	          example: [ "#00ff00", "336699" ],
	          process: function (bits) {
	            return [
	              parseInt(bits[ 1 ], 16), parseInt(bits[ 2 ], 16), parseInt(bits[ 3 ], 16), 1
	            ];
	          }
	        },
	        {
	          re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	          example: [ "#fb0", "f0f" ],
	          process: function (bits) {
	            return [
	              parseInt(bits[ 1 ] + bits[ 1 ], 16), parseInt(bits[ 2 ] + bits[ 2 ], 16), parseInt(bits[ 3 ] + bits[ 3 ], 16), 1
	            ];
	          }
	        }
	      ], r, g, b, a, i, re, processor, bits, channels, min, hsl, hsv, retcolor;

	    if (namedColor) {
	      color = namedColor;
	    } else {
	      color = color.replace(/^\s*#|\s*$/g, "");
	      if (color.length === 3) {
	        color = color.replace(/(.)/g, "$1$1");
	      }
	    }

	    // search through the definitions to find a match
	    for (i = 0; i < colorDefs.length; i += 1) {
	      re = colorDefs[ i ].re;
	      processor = colorDefs[ i ].process;
	      bits = re.exec(color);
	      if (bits) {
	        channels = processor(bits);
	        r = channels[ 0 ];
	        g = channels[ 1 ];
	        b = channels[ 2 ];
	        a = channels[ 3 ];
	      }
	    }
	    r = ( r < 0 || isNaN(r) ) ? 0 : ( ( r > 255 ) ? 255 : r );
	    g = ( g < 0 || isNaN(g) ) ? 0 : ( ( g > 255 ) ? 255 : g );
	    b = ( b < 0 || isNaN(b) ) ? 0 : ( ( b > 255 ) ? 255 : b );
	    a = ( a < 0 || isNaN(a) ) ? 0 : ( ( a > 1 ) ? 1 : a );
	    switch (newColor) {
	      case "rgba":
	        if (calculateOpacity) {
	          a = ( 255 - ( min = Math.min(r, g, b) ) ) / 255;
	          r = ( 0 || ( r - min ) / a ).toFixed(0);
	          g = ( 0 || ( g - min ) / a ).toFixed(0);
	          b = ( 0 || ( b - min ) / a ).toFixed(0);
	          a = a.toFixed(4);
	        }
	        retcolor = "rgba(" + r + "," + g + "," + b + "," + a + ")";
	        break;
	      case "rgb":
	        retcolor = "rgb(" + r + "," + g + "," + b + ")";
	        break;
	      case "hex":
	        retcolor = "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
	        break;
	      case "hsl":
	        hsl = rgbToHsl({ "r": r, "g": g, "b": b });
	        retcolor = "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%)";
	        break;
	      case "hsla":
	        hsl = rgbToHsl({ "r": r, "g": g, "b": b, "a": a });
	        retcolor = "hsl(" + hsl.h + "," + hsl.s + "%," + hsl.l + "%," + hsl.a + ")";
	        break;
	      case "hsv":
	        hsv = rgbToHsv({ "r": r, "g": g, "b": b });
	        retcolor = "hsv(" + hsv.h + "," + hsv.s + "%," + hsv.v + "%)";
	        break;
	      case "array":
	        retcolor = [r, g, b, a];
	        break;
	    }
	    return retcolor;
	  },
	  hslToRgb = function (bits) {
	    var rgba = {}, v, q, p, hsl = {
	      h: toPercent(parseInt(bits[ 1 ], 10) % 360, 360),
	      s: toPercent(parseInt(bits[ 2 ], 10) % 101, 100),
	      l: toPercent(parseInt(bits[ 3 ], 10) % 101, 100),
	      a: parseFloat(bits[ 4 ])
	    };
	    if (hsl.s === 0) {
	      v = parseInt(Math.round(255 * hsl.l));
	      rgba = {
	        r: v,
	        g: v,
	        b: v,
	        a: hsl.a
	      };
	    } else {
	      q = hsl.l < 0.5 ? hsl.l * ( 1 + hsl.s ) : hsl.l + hsl.s - hsl.l * hsl.s;
	      p = 2 * hsl.l - q;
	      rgba.r = parseInt(( hueToRgb(p, q, hsl.h + 1 / 3) * 256 ).toFixed(0), 10);
	      rgba.g = parseInt(( hueToRgb(p, q, hsl.h) * 256 ).toFixed(0), 10);
	      rgba.b = parseInt(( hueToRgb(p, q, hsl.h - 1 / 3) * 256 ).toFixed(0), 10);
	      rgba.a = hsl.a;
	    }
	    return rgba;
	  },
	  rgbToHsl = function (rgba) {
	    rgba.r = toPercent(parseInt(rgba.r, 10) % 256, 256);
	    rgba.g = toPercent(parseInt(rgba.g, 10) % 256, 256);
	    rgba.b = toPercent(parseInt(rgba.b, 10) % 256, 256);
	    var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), hsl = [], d;
	    hsl.a = rgba.a;
	    hsl.l = ( max + min ) / 2;
	    if (max === min) {
	      hsl.h = 0;
	      hsl.s = 0;
	    } else {
	      d = max - min;
	      hsl.s = hsl.l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
	      switch (max) {
	        case rgba.r:
	          hsl.h = ( rgba.g - rgba.b ) / d + ( rgba.g < rgba.b ? 6 : 0 );
	          break;
	        case rgba.g:
	          hsl.h = ( rgba.b - rgba.r ) / d + 2;
	          break;
	        case rgba.b:
	          hsl.h = ( rgba.r - rgba.g ) / d + 4;
	          break;
	      }
	      hsl.h /= 6;
	    }
	    hsl.h = parseInt(( hsl.h * 360 ).toFixed(0), 10);
	    hsl.s = parseInt(( hsl.s * 100 ).toFixed(0), 10);
	    hsl.l = parseInt(( hsl.l * 100 ).toFixed(0), 10);
	    return hsl;
	  },
	  hsvToRgb = function (bits) {
	    var rgb = {}, hsv = {
	        h: toPercent(parseInt(bits[ 1 ], 10) % 360, 360),
	        s: toPercent(parseInt(bits[ 2 ], 10) % 101, 100),
	        v: toPercent(parseInt(bits[ 3 ], 10) % 101, 100)
	      }, i = Math.floor(hsv.h * 6), f = hsv.h * 6 - i, p = hsv.v * ( 1 - hsv.s ), q = hsv.v * ( 1 - f * hsv.s ), t = hsv.v * ( 1 - ( 1 - f ) * hsv.s );
	    switch (i % 6) {
	      case 0:
	        rgb.r = hsv.v;
	        rgb.g = t;
	        rgb.b = p;
	        break;
	      case 1:
	        rgb.r = q;
	        rgb.g = hsv.v;
	        rgb.b = p;
	        break;
	      case 2:
	        rgb.r = p;
	        rgb.g = hsv.v;
	        rgb.b = t;
	        break;
	      case 3:
	        rgb.r = p;
	        rgb.g = q;
	        rgb.b = hsv.v;
	        break;
	      case 4:
	        rgb.r = t;
	        rgb.g = p;
	        rgb.b = hsv.v;
	        break;
	      case 5:
	        rgb.r = hsv.v;
	        rgb.g = p;
	        rgb.b = q;
	        break;
	    }
	    rgb.r = parseInt(rgb.r * 256, 10);
	    rgb.g = parseInt(rgb.g * 256, 10);
	    rgb.b = parseInt(rgb.b * 256, 10);
	    return {
	      "r": rgb.r,
	      "g": rgb.g,
	      "b": rgb.b
	    };
	  },
	  rgbToHsv = function (rgba) {
	    rgba.r = toPercent(parseInt(rgba.r, 10) % 256, 256);
	    rgba.g = toPercent(parseInt(rgba.g, 10) % 256, 256);
	    rgba.b = toPercent(parseInt(rgba.b, 10) % 256, 256);
	    var max = Math.max(rgba.r, rgba.g, rgba.b), min = Math.min(rgba.r, rgba.g, rgba.b), d = max - min, hsv = {
	        "h": 0,
	        "s": max === 0 ? 0 : d / max,
	        "v": max
	      };
	    if (max !== min) {
	      switch (max) {
	        case rgba.r:
	          hsv.h = ( rgba.g - rgba.b ) / d + ( rgba.g < rgba.b ? 6 : 0 );
	          break;
	        case rgba.g:
	          hsv.h = ( rgba.b - rgba.r ) / d + 2;
	          break;
	        case rgba.b:
	          hsv.h = ( rgba.r - rgba.g ) / d + 4;
	          break;
	      }
	      hsv.h /= 6;
	    }
	    hsv.h = parseInt(( hsv.h * 360 ).toFixed(0), 10);
	    hsv.s = parseInt(( hsv.s * 100 ).toFixed(0), 10);
	    hsv.v = parseInt(( hsv.v * 100 ).toFixed(0), 10);
	    return hsv;
	  },
	  hueToRgb = function (p, q, t) {
	    if (t < 0) {
	      t += 1;
	    }
	    if (t > 1) {
	      t -= 1;
	    }
	    if (t < 1 / 6) {
	      return p + ( q - p ) * 6 * t;
	    }
	    if (t < 1 / 2) {
	      return q;
	    }
	    if (t < 2 / 3) {
	      return p + ( q - p ) * ( 2 / 3 - t ) * 6;
	    }
	    return p;
	  },
	  toPercent = function (amount, limit) {
	    return amount / limit;
	  },
	  getNamedColor = function (color) {
	    var key, namedColor = null, namedColors = {
	        aliceblue: "f0f8ff",
	        antiquewhite: "faebd7",
	        aqua: "00ffff",
	        aquamarine: "7fffd4",
	        azure: "f0ffff",
	        beige: "f5f5dc",
	        bisque: "ffe4c4",
	        black: "000000",
	        blanchedalmond: "ffebcd",
	        blue: "0000ff",
	        blueviolet: "8a2be2",
	        brown: "a52a2a",
	        burlywood: "deb887",
	        cadetblue: "5f9ea0",
	        chartreuse: "7fff00",
	        chocolate: "d2691e",
	        coral: "ff7f50",
	        cornflowerblue: "6495ed",
	        cornsilk: "fff8dc",
	        crimson: "dc143c",
	        cyan: "00ffff",
	        darkblue: "00008b",
	        darkcyan: "008b8b",
	        darkgoldenrod: "b8860b",
	        darkgray: "a9a9a9",
	        darkgreen: "006400",
	        darkkhaki: "bdb76b",
	        darkmagenta: "8b008b",
	        darkolivegreen: "556b2f",
	        darkorange: "ff8c00",
	        darkorchid: "9932cc",
	        darkred: "8b0000",
	        darksalmon: "e9967a",
	        darkseagreen: "8fbc8f",
	        darkslateblue: "483d8b",
	        darkslategray: "2f4f4f",
	        darkturquoise: "00ced1",
	        darkviolet: "9400d3",
	        deeppink: "ff1493",
	        deepskyblue: "00bfff",
	        dimgray: "696969",
	        dodgerblue: "1e90ff",
	        feldspar: "d19275",
	        firebrick: "b22222",
	        floralwhite: "fffaf0",
	        forestgreen: "228b22",
	        fuchsia: "ff00ff",
	        gainsboro: "dcdcdc",
	        ghostwhite: "f8f8ff",
	        gold: "ffd700",
	        goldenrod: "daa520",
	        gray: "808080",
	        green: "008000",
	        greenyellow: "adff2f",
	        honeydew: "f0fff0",
	        hotpink: "ff69b4",
	        indianred: "cd5c5c",
	        indigo: "4b0082",
	        ivory: "fffff0",
	        khaki: "f0e68c",
	        lavender: "e6e6fa",
	        lavenderblush: "fff0f5",
	        lawngreen: "7cfc00",
	        lemonchiffon: "fffacd",
	        lightblue: "add8e6",
	        lightcoral: "f08080",
	        lightcyan: "e0ffff",
	        lightgoldenrodyellow: "fafad2",
	        lightgrey: "d3d3d3",
	        lightgreen: "90ee90",
	        lightpink: "ffb6c1",
	        lightsalmon: "ffa07a",
	        lightseagreen: "20b2aa",
	        lightskyblue: "87cefa",
	        lightslateblue: "8470ff",
	        lightslategray: "778899",
	        lightsteelblue: "b0c4de",
	        lightyellow: "ffffe0",
	        lime: "00ff00",
	        limegreen: "32cd32",
	        linen: "faf0e6",
	        magenta: "ff00ff",
	        maroon: "800000",
	        mediumaquamarine: "66cdaa",
	        mediumblue: "0000cd",
	        mediumorchid: "ba55d3",
	        mediumpurple: "9370d8",
	        mediumseagreen: "3cb371",
	        mediumslateblue: "7b68ee",
	        mediumspringgreen: "00fa9a",
	        mediumturquoise: "48d1cc",
	        mediumvioletred: "c71585",
	        midnightblue: "191970",
	        mintcream: "f5fffa",
	        mistyrose: "ffe4e1",
	        moccasin: "ffe4b5",
	        navajowhite: "ffdead",
	        navy: "000080",
	        oldlace: "fdf5e6",
	        olive: "808000",
	        olivedrab: "6b8e23",
	        orange: "ffa500",
	        orangered: "ff4500",
	        orchid: "da70d6",
	        palegoldenrod: "eee8aa",
	        palegreen: "98fb98",
	        paleturquoise: "afeeee",
	        palevioletred: "d87093",
	        papayawhip: "ffefd5",
	        peachpuff: "ffdab9",
	        peru: "cd853f",
	        pink: "ffc0cb",
	        plum: "dda0dd",
	        powderblue: "b0e0e6",
	        purple: "800080",
	        red: "ff0000",
	        rosybrown: "bc8f8f",
	        royalblue: "4169e1",
	        saddlebrown: "8b4513",
	        salmon: "fa8072",
	        sandybrown: "f4a460",
	        seagreen: "2e8b57",
	        seashell: "fff5ee",
	        sienna: "a0522d",
	        silver: "c0c0c0",
	        skyblue: "87ceeb",
	        slateblue: "6a5acd",
	        slategray: "708090",
	        snow: "fffafa",
	        springgreen: "00ff7f",
	        steelblue: "4682b4",
	        tan: "d2b48c",
	        teal: "008080",
	        thistle: "d8bfd8",
	        tomato: "ff6347",
	        turquoise: "40e0d0",
	        violet: "ee82ee",
	        violetred: "d02090",
	        wheat: "f5deb3",
	        white: "ffffff",
	        whitesmoke: "f5f5f5",
	        yellow: "ffff00",
	        yellowgreen: "9acd32"
	      };

	    for (key in namedColors) {
	      if (color === key) {
	        namedColor = namedColors[ key ];
	      }
	    }

	    return namedColor;
	  };
	  return color2color;
	})();
	module.exports = color2color;


/***/ }
/******/ ])
});
;