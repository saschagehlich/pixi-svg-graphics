var PIXI = require('pixi.js')
var color2color = require('./vendor/color2color')

function SVGGraphics (graphics) {
  this._graphics = graphics
}

/**
 * Draws the given node
 * @param  {SVGElement} node
 */
SVGGraphics.prototype.drawNode = function (node, worldTransform) {
  var tagName = node.tagName
  var capitalizedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1)
  if (!this['draw' + capitalizedTagName + 'Node']) {
    console.warn('No drawing behavior for ' + capitalizedTagName + ' node')
  } else {
    this['draw' + capitalizedTagName + 'Node'](node, worldTransform)
  }
}

/**
 * Draws the given root SVG node (and handles it as a group)
 * @param  {SVGSVGElement} node
 */
SVGGraphics.prototype.drawSvgNode = function (node) {
  this.drawGNode(node)
}

/**
 * Draws the given group svg node
 * @param  {SVGGroupElement} node
 */
SVGGraphics.prototype.drawGNode = function (node, worldTransform) {
  var children = node.children || node.childNodes
  var child
  for (var i = 0, len = children.length; i < len; i++) {
    child = children[i]
    if (child.nodeType !== 1) { continue }
    if (worldTransform == null) {
      worldTransform = child.getAttribute('transform')
    }
    this.drawNode(child, worldTransform)
  }
}

/**
 * Draws tje text svg node
 * @param {SVGTextElement} node 
 */
SVGGraphics.prototype.drawTextNode = function (node) {
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
  this._graphics.addChild(pixi_text)
}

/**
 * Draws the given line svg node
 * @param  {SVGLineElement} node
 */
SVGGraphics.prototype.drawLineNode = function (node) {
  this.applySvgAttributes(node)

  var x1 = parseFloat(node.getAttribute('x1'))
  var y1 = parseFloat(node.getAttribute('y1'))
  var x2 = parseFloat(node.getAttribute('x2'))
  var y2 = parseFloat(node.getAttribute('y2'))

  this._graphics.moveTo(x1, y1)
  this._graphics.lineTo(x2, y2)
}

/**
 * Draws the given polyline svg node
 * @param  {SVGPolylineElement} node
 */
SVGGraphics.prototype.drawPolylineNode = function (node) {
  this.applySvgAttributes(node)

  var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)'
  var points = node.getAttribute('points').match(new RegExp(reg, 'g'))

  var point
  for (var i = 0, len = points.length; i < len; i++) {
    point = points[i]
    var coords = point.match(new RegExp(reg))

    coords[1] = parseFloat(coords[1])
    coords[2] = parseFloat(coords[2])

    if (i === 0) {
      this._graphics.moveTo(coords[1], coords[2])
    } else {
      this._graphics.lineTo(coords[1], coords[2])
    }
  }
}

/**
 * Draws the given circle node
 * @param  {SVGCircleElement} node
 */
SVGGraphics.prototype.drawCircleNode = function (node) {
  this.applySvgAttributes(node)

  var cx = parseFloat(node.getAttribute('cx'))
  var cy = parseFloat(node.getAttribute('cy'))
  var r = parseFloat(node.getAttribute('r'))

  this._graphics.drawCircle(cx, cy, r)
}

/**
 * Draws the given ellipse node
 * @param  {SVGCircleElement} node
 */
SVGGraphics.prototype.drawEllipseNode = function (node) {
  this.applySvgAttributes(node)

  var cx = parseFloat(node.getAttribute('cx'))
  var cy = parseFloat(node.getAttribute('cy'))
  var rx = parseFloat(node.getAttribute('rx'))
  var ry = parseFloat(node.getAttribute('ry'))

  this._graphics.drawEllipse(cx, cy, rx, ry)
}

/**
 * Draws the given rect node
 * @param  {SVGRectElement} node
 */
SVGGraphics.prototype.drawRectNode = function (node) {
  this.applySvgAttributes(node)

  var x = parseFloat(node.getAttribute('x'))
  var y = parseFloat(node.getAttribute('y'))
  var width = parseFloat(node.getAttribute('width'))
  var height = parseFloat(node.getAttribute('height'))

  this._graphics.drawRect(x, y, width, height)
}

/**
 * Draws the given polygon node
 * @param  {SVGPolygonElement} node
 */
SVGGraphics.prototype.drawPolygonNode = function (node) {
  var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)'
  var points = node.getAttribute('points').match(new RegExp(reg, 'g'))

  var path = []
  var point
  for (var i = 0, len = points.length; i < len; i++) {
    point = points[i]
    var coords = point.match(new RegExp(reg))

    coords[1] = parseFloat(coords[1])
    coords[2] = parseFloat(coords[2])

    path.push(new PIXI.Point(
      coords[1],
      coords[2]
    ))
  }

  this.applySvgAttributes(node)
  this._graphics.drawPolygon(path)
}

/**
 * Draws the given path svg node
 * @param  {SVGPathElement} node
 */
SVGGraphics.prototype.drawPathNode = function (node, worldTransform) {
  this.applySvgAttributes(node)
  var d = node.getAttribute('d').trim()
  var commands = d.match(/[a-df-z][^a-df-z]*/ig)
  var command, lastControl
  var lastCoord = {
    x: 0,
    y: 0
  }
  var triangles = []
  var j, argslen
  var pathIndex = 0

  for (var i = 0, len = commands.length; i < len; i++) {
    command = commands[i]
    var commandType = command[0]
    var args = command.slice(1).trim().split(/[\s,]+|(?=\s?[+\-])/)

    for (j = 0, argslen = args.length; j < argslen; j++) {
      args[j] = parseFloat(args[j])
    }

    var z = 0
    while (z < args.length) {
      var offset = {
        x: 0,
        y: 0
      }
      if (commandType === commandType.toLowerCase()) {
        // Relative positions
        offset = lastCoord
      }

      switch (commandType.toLowerCase()) {
        // moveto command
        case 'm':
          args[z] += offset.x
          args[z + 1] += offset.y

          if (z == 0) {
            this._graphics.moveTo(args[z], args[z + 1])
            this._graphics.graphicsData[this._graphics.graphicsData.length-1].shape.closed = false
          } else {
            this._graphics.lineTo(args[z], args[z+1])
          }
          lastCoord = { x: args[z], y: args[z + 1] }
          z += 2
          break
        // lineto command
        case 'l':
          args[z] += offset.x
          args[z + 1] += offset.y

          this._graphics.lineTo(
            args[z],
            args[z + 1]
          )
          lastCoord = { x: args[z], y: args[z + 1] }
          z += 2
          break
        // curveto command
        case 'c':
          for (var k = 0; k < 6; k += 2) {
            args[k + z] += offset.x
            args[k + z + 1] += offset.y
          }

          this._graphics.bezierCurveTo(
            args[z],
            args[z + 1],
            args[z + 2],
            args[z + 3],
            args[z + 4],
            args[z + 5]
          )
          lastCoord = { x: args[z + 4], y: args[z + 5] }
          lastControl = { x: args[z + 2], y: args[z + 3] }
          z += 6
          break
        // vertial lineto command
        case 'v':
          args[z] += offset.y

          this._graphics.lineTo(lastCoord.x, args[0])
          lastCoord.y = args[0]
          z += 1
          break
        // horizontal lineto command
        case 'h':
          args[z] += offset.x

          this._graphics.lineTo(args[z], lastCoord.y)
          lastCoord.x = args[z]
          z += 1
          break
        // quadratic curve command
        case 's':
          for (var l = 0; l < 4; l += 2) {
            args[l + z] += offset.x
            args[l + z + 1] += offset.y
          }

          var rx = 2 * lastCoord.x - lastControl.x
          var ry = 2 * lastCoord.y - lastControl.y

          this._graphics.bezierCurveTo(
            rx,
            ry,
            args[z],
            args[z + 1],
            args[z + 2],
            args[z + 3]
          )
          lastCoord = { x: args[z + 2], y: args[z + 3] }
          lastControl = { x: args[z], y: args[z + 1] }
          z += 4
          break
        // closepath command
        case 'z':
          z += 1
          this._graphics.graphicsData[this._graphics.graphicsData.length-1].shape.closed = true
          // Z command is handled by M
          break
        default:
          throw new Error('Could not handle path command: ' + commandType + ' ' + args.join(','))
      }
    }
  }

  //TODO add support for transformations
  if(worldTransform != null) {
    var matrix_commands = worldTransform.substr(7).split(',')
    var matrix = new PIXI.Matrix()
    matrix.fromArray(matrix_commands)
    this._graphics.worldTransform = matrix
    this._graphics.updateTransform()
  }

}

/**
 * Applies the given node's attributes to our PIXI.Graphics object
 * @param  {SVGElement} node
 */
SVGGraphics.prototype.applySvgAttributes = function (node) {
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
  this._graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha)

  // Apply fill style
  var fillColor = 0x000000, fillAlpha = 0
  if (attributes.fill) {
    color = color2color(attributes.fill, 'array')
    intColor = 256 * 256 * color[0] + 256 * color[1] + color[2]
    fillColor = intColor
    fillAlpha = color[3]

    this._graphics.beginFill(fillColor, fillAlpha)
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
    svgGraphics.drawNode(children[i])
  }
}

module.exports = SVGGraphics;
