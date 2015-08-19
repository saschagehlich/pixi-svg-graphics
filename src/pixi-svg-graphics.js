var PIXI = require('pixi.js')
var color2color = require('./vendor/color2color')

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
  var tokens = this.tokenizePathData(d)
  var lastControl
  var lastCoord = {
    x: 0,
    y: 0
  }

  for (var i = 0; i < tokens.length; i++) {
    var command = tokens[i].command
    var args = tokens[i].args
    var z = 0
    while (z < args.length) {
      var offset = {
        x: 0,
        y: 0
      }
      if (command === command.toLowerCase()) {
        // Relative positions
        offset = lastCoord
      }

      switch (command.toLowerCase()) {
        // moveto command
        case 'm':
          args[z] += offset.x
          args[z + 1] += offset.y

          if (z == 0) {
            graphics.moveTo(args[z], args[z + 1])
            graphics.graphicsData[graphics.graphicsData.length-1].shape.closed = false
          } else {
            graphics.lineTo(args[z], args[z+1])
          }
          lastCoord = { x: args[z], y: args[z + 1] }
          z += 2
          break
        // lineto command
        case 'l':
          args[z] += offset.x
          args[z + 1] += offset.y

          graphics.lineTo(
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

          graphics.bezierCurveTo(
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

          graphics.lineTo(lastCoord.x, args[0])
          lastCoord.y = args[0]
          z += 1
          break
        // horizontal lineto command
        case 'h':
          args[z] += offset.x

          graphics.lineTo(args[z], lastCoord.y)
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

          graphics.bezierCurveTo(
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
  var tokens = []
  for(var i = 0; i < commands.length; i++) {
    var token = {}
    var args = commands[i].slice(1).trim().match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g)
    if(args == null) {
      args = [0]
    }
    for(var p = 0; p < args.length; p++) {
      args[p] = parseScientific(args[p])
    }
    token.command = commands[i][0]
    token.args = args
    tokens.push(token)
  }
  return tokens
}

SVGGraphics.prototype.getPathDirection = function(path) {

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
