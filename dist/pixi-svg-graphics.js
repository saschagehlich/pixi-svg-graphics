(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return require("pixi.js"); } catch(e) {} }()));
	else if(typeof define === 'function' && define.amd)
		define(["pixi.js"], factory);
	else if(typeof exports === 'object')
		exports["SVGGraphics"] = factory((function webpackLoadOptionalExternalModule() { try { return require("pixi.js"); } catch(e) {} }()));
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

	/* @flow weak */

	try{
	    var PIXI = __webpack_require__(1)
	} catch (err){
	    var PIXI = window.PIXI
	    console.log(err)
	}

	var color2color = __webpack_require__(2)

	function SVGGraphics(svg) {
	    PIXI.Graphics.call(this);
	    this._scale = 1;
	    this._svg = svg;
	    this._wt = new PIXI.Matrix();
	    this._classes = {};
	    this._lineWidth = 0;
	    this._nonScaling = false;
	    if (svg) {
	        this.drawSVG(svg);
	    }
	}


	PIXI.Graphics.prototype.lineTo2 = function (x, y) {
	    if (!this.lineDashed) {
	        this.currentPath.shape.points.push(x, y);
	    } else {
	        var points = this.currentPath.shape.points;
	        var fromX = points[points.length - 2];
	        var fromY = points[points.length - 1];
	        var distance = Math.abs(Math.sqrt(Math.pow(x - fromX, 2) + Math.pow(y - fromY, 2)));
	        if (distance <= this.lineDashLength) {
	            this.currentPath.shape.points.push(x, y);
	        } else {
	            var spaceSegment = this.lineSpaceLength / distance
	            var dashSegment = this.lineDashLength / distance
	            var currSegment = dashSegment

	            var dashOn = false;
	            var pX, pY;
	            for (var i = currSegment; i <= 1; i += currSegment) {

	                var t = Math.max(Math.min(i, 1), 0);
	                pX = fromX + (t * (x - fromX));
	                pY = fromY + (t * (y - fromY));

	                dashOn = !dashOn;
	                if (dashOn) {
	                    currSegment = spaceSegment
	                    this.currentPath.shape.points.push(pX, pY);
	                } else {
	                    currSegment = dashSegment
	                    this.currentPath.shape.closed = false;
	                    this.moveTo(pX, pY);
	                }
	            }

	            dashOn = !dashOn;
	            if (dashOn && (pX != x && pY != y)) {
	                this.currentPath.shape.points.push(x, y);
	            }
	        }
	    }
	    this.dirtyScale = true;

	    return this;
	}

	PIXI.Graphics.prototype.bezierCurveTo2 = function (cpX, cpY, cpX2, cpY2, toX, toY) {
	    if (this.currentPath) {
	        if (this.currentPath.shape.points.length === 0)this.currentPath.shape.points = [0, 0];
	    }
	    else {
	        this.moveTo(0, 0);
	    }

	    var n = this.lineSegments,
	        dt,
	        dt2,
	        dt3,
	        t2,
	        t3,
	        points = this.currentPath.shape.points;

	    var fromX = points[points.length - 2];
	    var fromY = points[points.length - 1];

	    var j = 0;

	    //0 = drawSpace; 1 = drawLine
	    var state = 1;
	    var lPx = null, lPy = null;

	    for (var i = 1; i <= n; i++) {
	        j = i / n;

	        dt = (1 - j);
	        dt2 = dt * dt;
	        dt3 = dt2 * dt;

	        t2 = j * j;
	        t3 = t2 * j;

	        //calculate next point
	        nPx = dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX;
	        nPy = dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY;

	        if (!this.lineDashed) {
	            points.push(nPx, nPy);
	            continue;
	        }

	        if (lPx == null) {
	            lPx = nPx;
	            lPy = nPy;
	        }

	        //calculate distance between last and next point
	        var distance = Math.abs(Math.sqrt(Math.pow(nPx - lPx, 2) + Math.pow(nPy - lPy, 2)));
	        if (state == 0) {
	            if (distance >= this.lineSpaceLength) {
	                lPx = nPx;
	                lPy = nPy;
	                this.currentPath.shape.closed = false;
	                this.moveTo(nPx, nPy);
	                points = this.currentPath.shape.points;
	                state = 1;
	            }
	        } else if (state == 1) {
	            if (distance <= this.lineDashLength) {
	                points.push(nPx, nPy);
	            } else {
	                lPx = nPx;
	                lPy = nPy;
	                state = 0;
	            }
	        }
	    }

	    this.currentPath.shape.closed = false;
	    this.dirtyScale = true;

	    return this;
	}

	PIXI.Graphics.prototype.quadraticCurveTo2 = function (cpX, cpY, toX, toY) {
	    if (this.currentPath) {
	        if (this.currentPath.shape.points.length === 0)this.currentPath.shape.points = [0, 0];
	    }
	    else {
	        this.moveTo(0, 0);
	    }

	    var xa,
	        ya,
	        n = this.lineSegments,
	        points = this.currentPath.shape.points;
	    if (points.length === 0)this.moveTo(0, 0);


	    var fromX = points[points.length - 2];
	    var fromY = points[points.length - 1];

	    var j = 0;
	    var state = 1;
	    var lPx = null, lPy = null;
	    for (var i = 1; i <= n; i++) {
	        j = i / n;

	        xa = fromX + ( (cpX - fromX) * j );
	        ya = fromY + ( (cpY - fromY) * j );

	        nPx = xa + ( ((cpX + ( (toX - cpX) * j )) - xa) * j );
	        nPy = ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j );

	        if (!this.lineDashed) {
	            points.push(nPx, nPy);
	            continue;
	        }

	        if (lPx == null) {
	            lPx = nPx;
	            lPy = nPy;
	        }

	        //calculate distance between last and next point
	        var distance = Math.abs(Math.sqrt(Math.pow(nPx - lPx, 2) + Math.pow(nPy - lPy, 2)));
	        if (state == 0) {
	            if (distance >= this.lineSpaceLength) {
	                lPx = nPx;
	                lPy = nPy;
	                this.currentPath.shape.closed = false;
	                this.moveTo(nPx, nPy);
	                points = this.currentPath.shape.points;
	                state = 1;
	            }
	        } else if (state == 1) {
	            if (distance <= this.lineDashLength) {
	                points.push(nPx, nPy);
	            } else {
	                lPx = nPx;
	                lPy = nPy;
	                state = 0;
	            }
	        }
	    }


	    this.dirtyScale = true;

	    return this;
	}

	SVGGraphics.prototype = Object.create(PIXI.Graphics.prototype);

	SVGGraphics.prototype.clone = function(){
	        var clone = new SVGGraphics(this._svg);

	        clone.children = [];
	        clone.scale = new PIXI.Point(this.scale.x, this.scale.y);
	        clone.rotation = this.rotation;
	        clone.x = this.x;
	        clone.y = this.y;

	        for(var i=0;i<this.children.length;i++){
	            var child = this.children[i];
	            var childClone = child.clone();
	            clone.addChild(childClone);
	        }

	        return clone
	};

	/**
	 * Draws the given node
	 * @param  {SVGElement} node
	 */
	SVGGraphics.prototype.drawNode = function (node) {
	    var tagName = node.tagName;
	    var capitalizedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
	    this.applyTransformation(node);
	    if (!this['draw' + capitalizedTagName + 'Node']) {
	        console.warn('No drawing behavior for ' + capitalizedTagName + ' node');
	    } else {
	        if (capitalizedTagName == 'Svg') {
	            var width = node.getAttribute('width');
	            var height = node.getAttribute('height');
	            this.beginFill(0x000, 0).drawRect(0, 0, parseInt(width), parseInt(height));
	        }
	        this['draw' + capitalizedTagName + 'Node'](node);
	    }
	}

	/**
	 * Draws the given root SVG node (and handles it as a group)
	 * @param  {SVGSVGElement} node
	 */
	SVGGraphics.prototype.drawSvgNode = function (node) {
	    var children = node.children || node.childNodes;
	    for (var i = 0; i < children.length; i++) {
	        var child = children[i];
	        if (child.tagName == 'style') {
	            var regAttr = /{([^}]*)}/g;
	            var regName = /\.([^{;]*){/g;
	            var classNames = child.childNodes[0].data.match(regName);
	            var classAttrs = child.childNodes[0].data.match(regAttr);
	            for (var p = 0; p < classNames.length; p++) {
	                var className = classNames[p].substring(1, classNames[p].length - 1);
	                var classAttr = classAttrs[p].substring(1, classAttrs[p].length - 1);
	                this._classes[className] = classAttr;
	            }
	        }
	    }
	    this.drawGNode(node);
	}

	/**
	 * Draws the given group svg node
	 * @param  {SVGGroupElement} node
	 */
	SVGGraphics.prototype.drawGNode = function (node) {
	    var children = node.children || node.childNodes;
	    var child;
	    for (var i = 0, len = children.length; i < len; i++) {
	        child = children[i];
	        if (child.nodeType !== 1) {
	            continue;
	        }
	        this.drawNode(child);
	    }
	}

	/**
	 * Draws tje text svg node
	 * @param {SVGTextElement} node
	 */
	SVGGraphics.prototype.drawTextNode = function (node) {
	    var styles = node.getAttribute('style').split(";");
	    var styles_obj = {};
	    for (var i = 0; i < styles.length; i++) {
	        var splitted_style = styles[i].split(':');
	        var key = splitted_style[0];
	        var val = splitted_style[1];
	        styles_obj[key] = val;
	    }
	    var fontFamily = styles_obj['font-family'];
	    var fontSize = styles_obj['font-size'];
	    var fill = styles_obj['fill'];
	    var tspan = node.childNodes[0];
	    var text = tspan.innerHTML || tspan.textContent;

	    var pixi_text = new PIXI.Text(text, {fontFamily: fontFamily, fontSize: fontSize, fill: fill});
	    var x = tspan.getAttribute('x') || node.getAttribute('x') || 0;
	    var y = tspan.getAttribute('y') || node.getAttribute('y') || 0;
	    pixi_text.x = parseInt(x);
	    pixi_text.y = parseInt(y) - pixi_text.height + PIXI.TextMetrics._fonts[pixi_text._font].descent;
	    this.addChild(pixi_text);
	}

	/**
	 * Draws the given line svg node
	 * @param  {SVGLineElement} node
	 */
	SVGGraphics.prototype.drawLineNode = function (node) {
	    this.parseSvgAttributes(node);

	    var x1 = parseScientific(node.getAttribute('x1'));
	    var y1 = parseScientific(node.getAttribute('y1'));
	    var x2 = parseScientific(node.getAttribute('x2'));
	    var y2 = parseScientific(node.getAttribute('y2'));

	    this.moveTo(x1, y1);
	    this.lineTo2(x2, y2);
	}

	/**
	 * Draws the given polyline svg node
	 * @param  {SVGPolylineElement} node
	 */
	SVGGraphics.prototype.drawPolylineNode = function (node) {
	    this.parseSvgAttributes(node);

	    var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)';
	    var points = node.getAttribute('points').match(new RegExp(reg, 'g'));

	    var point;
	    for (var i = 0, len = points.length; i < len; i++) {
	        point = points[i];
	        var coords = point.match(new RegExp(reg));

	        coords[1] = parseScientific(coords[1]);
	        coords[2] = parseScientific(coords[2]);

	        if (i === 0) {
	            this.moveTo(coords[1], coords[2]);
	        } else {
	            this.lineTo2(coords[1], coords[2]);
	        }
	    }
	}

	/**
	 * Draws the given circle node
	 * @param  {SVGCircleElement} node
	 */
	SVGGraphics.prototype.drawCircleNode = function (node) {
	    this.parseSvgAttributes(node);

	    var cx = parseScientific(node.getAttribute('cx'));
	    var cy = parseScientific(node.getAttribute('cy'));
	    var r = parseScientific(node.getAttribute('r'));

	    this.drawCircle(cx, cy, r);
	}

	/**
	 * Draws the given ellipse node
	 * @param  {SVGCircleElement} node
	 */
	SVGGraphics.prototype.drawEllipseNode = function (node) {
	    this.parseSvgAttributes(node);

	    var cx = parseScientific(node.getAttribute('cx'));
	    var cy = parseScientific(node.getAttribute('cy'));
	    var rx = parseScientific(node.getAttribute('rx'));
	    var ry = parseScientific(node.getAttribute('ry'));

	    this.drawEllipse(cx, cy, rx, ry);
	}

	/**
	 * Draws the given rect node
	 * @param  {SVGRectElement} node
	 */
	SVGGraphics.prototype.drawRectNode = function (node) {
	    this.parseSvgAttributes(node);

	    var x = parseScientific(node.getAttribute('x'));
	    var y = parseScientific(node.getAttribute('y'));
	    var width = parseScientific(node.getAttribute('width'));
	    var height = parseScientific(node.getAttribute('height'));

	    this.drawRect(x, y, width, height);
	}

	/**
	 * Draws the given polygon node
	 * @param  {SVGPolygonElement} node
	 */
	SVGGraphics.prototype.drawPolygonNode = function (node) {
	    var reg = '(-?[\\d\\.?]+),(-?[\\d\\.?]+)';
	    var points = node.getAttribute('points').match(new RegExp(reg, 'g'));

	    var path = [];
	    var point;
	    for (var i = 0, len = points.length; i < len; i++) {
	        point = points[i];
	        var coords = point.match(new RegExp(reg));

	        coords[1] = parseScientific(coords[1]);
	        coords[2] = parseScientific(coords[2]);

	        path.push(new PIXI.Point(
	            coords[1],
	            coords[2]
	        ));
	    }

	    this.parseSvgAttributes(node);
	    this.drawPolygon(path);
	}

	/**
	 * Draws the given path svg node
	 * @param  {SVGPathElement} node
	 */
	SVGGraphics.prototype.drawPathNode = function (node) {
	    this.parseSvgAttributes(node);
	    var d = node.getAttribute('d').trim();
	    var data = this.tokenizePathData(d);
	    this.drawPathData(data);
	}

	/**
	 * Draw the given tokenized path data object
	 */
	SVGGraphics.prototype.drawPathData = function (data) {
	    var instructions = data.instructions;
	    var subPathIndices = []

	    for (var j = 0; j < instructions.length; j++) {
	        if (instructions[j].command.toLowerCase() === 'm') {
	            subPathIndices.push(j)
	        }
	    }

	    for (var i = 0; i < instructions.length; i++) {
	        var command = instructions[i].command;
	        var points = instructions[i].points;
	        var z = 0;
	        if (command.toLowerCase() === 'z' && points.length === 0) {
	            points.length = 1
	        }
	        while (z < points.length) {
	            switch (command.toLowerCase()) {
	                // moveto command
	                case 'm':
	                    var x = points[z].x;
	                    var y = points[z].y;

	                    if (z === 0) {
	                        if(subPathIndices.indexOf(i) >= 2) {
	                            this.addHole()
	                        }
	                        this.moveTo(x, y);
	                        this.graphicsData[this.graphicsData.length -1].shape.closed = false
	                    } else {
	                        this.lineTo2(x, y);
	                    }
	                    z += 1;
	                    break;
	                // lineto command
	                case 'l':
	                    var x = points[z].x;
	                    var y = points[z].y;

	                    this.lineTo2(x, y);
	                    z += 1;
	                    break;
	                // curveto command
	                case 'c':
	                    this.bezierCurveTo2(
	                        points[z].x,
	                        points[z].y,
	                        points[z + 1].x,
	                        points[z + 1].y,
	                        points[z + 2].x,
	                        points[z + 2].y
	                    );
	                    z += 3;
	                    break;
	                // vertial lineto command
	                case 'v':
	                    var x = points[z].x
	                    var y = points[z].y

	                    this.lineTo2(x, y);
	                    z += 1;
	                    break;
	                // horizontal lineto command
	                case 'h':
	                    var x = points[z].x
	                    var y = points[z].y

	                    this.lineTo2(x, y);
	                    z += 1;
	                    break;
	                // bezier curve command
	                case 's':
	                    this.bezierCurveTo2(
	                        points[z].x,
	                        points[z].y,
	                        points[z + 1].x,
	                        points[z + 1].y,
	                        points[z + 2].x,
	                        points[z + 2].y
	                    );
	                    z += 3;
	                    break;
	                // closepath command
	                case 'z':
	                    this.graphicsData[this.graphicsData.length -1].shape.closed = true
	                    z += 1;
	                    break;
	                default:
	                    throw new Error('Could not handle path command: ' + command);
	            }
	        }
	    }
	    // add the last subpath as a hole if there were holes added before and there is no z command in the end
	    if (subPathIndices.length > 1) {
	        this.addHole()
	    }
	}

	SVGGraphics.prototype.tokenizePathData = function (pathData) {
	    var commands = pathData.match(/[a-df-z][^a-df-z]*/ig);
	    var data = {
	        instructions: []
	    };

	    //needed to calculate absolute position of points
	    var lastPoint = {
	        x: 0,
	        y: 0
	    };
	    var lastControl = null

	    for (var i = 0; i < commands.length; i++) {
	        var instruction = {
	            command: '',
	            points: []
	        };
	        var command = commands[i][0];
	        var args = [];

	        //allow any decimal number in normal or scientific form
	        args = args.concat(commands[i].slice(1).trim().match(/[+|-]?(?:0|[0-9]\d*)?(?:\.\d*)?(?:[eE][+\-]?\d+)?/g));

	        for(var j= args.length-1;j>= 0;j--){
	            var arg = args[j];
	            if(arg === ""){
	                args.splice(j, 1)
	            }
	        }

	        var p = 0;
	        while (p < args.length) {
	            var offset = {
	                x: 0,
	                y: 0
	            };
	            if (command === command.toLowerCase()) {
	                // Relative positions
	                offset = lastPoint;
	            }
	            var points = [];
	            switch (command.toLowerCase()) {
	                case 'm':
	                    var point = {};
	                    point.x = parseScientific(args[p]) + offset.x;
	                    point.y = parseScientific(args[p + 1]) + offset.y;
	                    points.push(point);
	                    lastPoint = point;
	                    p += 2;
	                    break;
	                case 'l':
	                    var point = {};
	                    point.x = parseScientific(args[p]) + offset.x;
	                    point.y = parseScientific(args[p + 1]) + offset.y;
	                    points.push(point);
	                    lastPoint = point;
	                    p += 2;
	                    break;
	                case 'c':
	                    var point1 = {} , point2 = {} , point3 = {};
	                    point1.x = parseScientific(args[p]) + offset.x;
	                    point1.y = parseScientific(args[p + 1]) + offset.y;
	                    point2.x = parseScientific(args[p + 2]) + offset.x;
	                    point2.y = parseScientific(args[p + 3]) + offset.y;
	                    point3.x = parseScientific(args[p + 4]) + offset.x;
	                    point3.y = parseScientific(args[p + 5]) + offset.y;
	                    points.push(point1);
	                    points.push(point2);
	                    points.push(point3);
	                    lastPoint = point3;
	                    lastControl = point2;
	                    p += 6;
	                    break;
	                case 'v':
	                    var point = {};
	                    point.y = parseScientific(args[p]) + offset.y;
	                    point.x = lastPoint.x;
	                    points.push(point);
	                    lastPoint = point;
	                    p += 1;
	                    break;
	                case 'h':
	                    var point = {};
	                    point.x = parseScientific(args[p]) + offset.x;
	                    point.y = lastPoint.y;
	                    points.push(point);
	                    lastPoint = point;
	                    p += 1;
	                    break;
	                case 's':
	                    var point1 = {} , point2 = {}, point3 = {};
	                    if(lastControl === null) {
	                        point1.x = lastPoint.x
	                        point1.y = lastPoint.y
	                    } else {
	                        point1.x = lastControl.x;
	                        point1.y = lastControl.y;
	                    }
	                    point2.x = parseScientific(args[p]) + offset.x;
	                    point2.y = parseScientific(args[p + 1]) + offset.y;
	                    point3.x = parseScientific(args[p + 2]) + offset.x;
	                    point3.y = parseScientific(args[p + 3]) + offset.y;
	                    points.push(point1);
	                    points.push(point2);
	                    points.push(point3);
	                    lastPoint = point3;
	                    lastControl = point2;
	                    p += 4;
	                    break;
	                default:
	                    p += 1;
	                    break;
	            }
	            instruction.points = instruction.points.concat(points);
	        }
	        instruction.command = command;
	        data.instructions.push(instruction);
	    }

	    return data;
	}

	SVGGraphics.prototype.applyTransformation = function (node) {
	    if (node.getAttribute('transform')) {
	        var transformMatrix = new PIXI.Matrix();
	        var transformAttr = node.getAttribute('transform').trim().split('(');
	        var transformCommand = transformAttr[0];
	        var transformValues = transformAttr[1].replace(')', '');
	        transformValues = splitAttributeParams(transformValues);

	        if (transformCommand == 'matrix') {
	            transformMatrix.a = parseScientific(transformValues[0]);
	            transformMatrix.b = parseScientific(transformValues[1]);
	            transformMatrix.c = parseScientific(transformValues[2]);
	            transformMatrix.d = parseScientific(transformValues[3]);
	            transformMatrix.tx = parseScientific(transformValues[4]);
	            transformMatrix.ty = parseScientific(transformValues[5]);
	            var point = {x: 0, y: 0};
	            var trans_point = transformMatrix.apply(point);
	            this.x += trans_point.x;
	            this.y += trans_point.y;
	            this.scale.x = Math.sqrt(transformMatrix.a * transformMatrix.a + transformMatrix.b * transformMatrix.b);
	            this.scale.y = Math.sqrt(transformMatrix.c * transformMatrix.c + transformMatrix.d * transformMatrix.d);

	            this.rotation = -Math.acos(transformMatrix.a / this.scale.x);
	        } else if (transformCommand == 'translate') {
	            this.x += parseScientific(transformValues[0]);
	            this.y += parseScientific(transformValues[1]);
	        } else if (transformCommand == 'scale') {
	            this.scale.x = parseScientific(transformValues[0]);
	            this.scale.y = parseScientific(transformValues[1]);
	        } else if (transformCommand == 'rotate') {
	            if (transformValues.length > 1) {
	                this.x += parseScientific(transformValues[1]);
	                this.y += parseScientific(transformValues[2]);
	            }

	            this.rotation = parseScientific(transformValues[0]);

	            if (transformValues.length > 1) {
	                this.x -= parseScientific(transformValues[1]);
	                this.y -= parseScientific(transformValues[2]);
	            }
	        }
	    }
	}

	/**
	 * Applies the given node's attributes to our PIXI.Graphics object
	 * @param  {SVGElement} node
	 */
	SVGGraphics.prototype.parseSvgAttributes = function (node) {
	    var attributes = {};

	    // Get node attributes
	    var i = node.attributes.length;
	    var attribute;
	    while (i--) {
	        attribute = node.attributes[i];
	        attributes[attribute.name] = attribute.value;
	    }

	    // CSS attributes override node attributes
	    var cssClasses = node.getAttribute('class');
	    if (cssClasses) {
	        cssClasses = cssClasses.split(' ');
	    } else {
	        cssClasses = [];
	    }
	    var style = node.getAttribute('style');
	    if (style) {
	        this._classes['style'] = style;
	        cssClasses.push('style');
	    }
	    for (var c in this._classes) {
	        if (cssClasses.indexOf(c) != -1) {
	            style = this._classes[c];
	            var pairs, pair, split, key, value;
	            if (style) {
	                // Simply parse the inline css
	                pairs = style.split(';');
	                for (var j = 0, len = pairs.length; j < len; j++) {
	                    pair = pairs[j].trim();
	                    if (!pair) {
	                        continue;
	                    }

	                    split = pair.split(':', 2);
	                    key = split[0].trim();
	                    value = split[1].trim();
	                    attributes[key] = value;
	                }
	            }
	        }
	    }
	    this.applySvgAttributes(attributes);
	}

	SVGGraphics.prototype.applySvgAttributes = function (attributes) {

	    // Apply stroke style
	    var strokeColor = 0x000000, strokeWidth = 1, strokeAlpha = 0;

	    var color, intColor;
	    if (attributes.stroke) {
	        color = color2color(attributes.stroke, 'array');
	        intColor = 256 * 256 * color[0] + 256 * color[1] + color[2];
	        strokeColor = intColor;
	        strokeAlpha = color[3];
	    }

	    if (attributes['stroke-width']) {
	        this._lineWidth = strokeWidth = parseInt(attributes['stroke-width'], 10);
	    }

	    var vectorEffect = attributes['vector-effect'];
	    if (vectorEffect == 'non-scaling-stroke') {
	        this._nonScaling = true;
	    }

	    var strokeSegments = 100, strokeDashLength = 100, strokeSpaceLength = 0, strokeDashed = false;
	    if (attributes['stroke-dasharray'] && attributes['stroke-dasharray'] != 'none') {
	        //ignore unregular dasharray
	        var params = splitAttributeParams(attributes['stroke-dasharray']);
	        strokeDashLength = parseInt(params[0]);
	        strokeSpaceLength = parseInt(params[1]);
	        strokeDashed = true;
	    }
	    this.lineSegments = strokeSegments;
	    this.lineDashed = strokeDashed;
	    this.lineDashLength = strokeDashLength;
	    this.lineSpaceLength = strokeSpaceLength;

	    this.lineStyle(strokeWidth, strokeColor, strokeAlpha);

	    // Apply fill style
	    var fillColor = 0x000000, fillAlpha = 1;
	    if (attributes.fill) {
	        color = color2color(attributes.fill, 'array');
	        intColor = 256 * 256 * color[0] + 256 * color[1] + color[2];
	        fillColor = intColor;
	        fillAlpha = color[3];
	    }
	    this.beginFill(fillColor, fillAlpha);
	}

	/**
	 * Builds a PIXI.Graphics object from the given SVG document
	 * @param  {PIXI.Graphics} graphics
	 * @param  {SVGDocument} svg
	 */
	SVGGraphics.prototype.drawSVG = function (svg) {
	    var children = svg.children || svg.childNodes;
	    for (var i = 0, len = children.length; i < len; i++) {
	        if (children[i].nodeType !== 1) {
	            continue;
	        }
	        this.drawNode(children[i]);
	    }
	}


	var splitAttributeParams = function(attr){
	    if(attr.indexOf(",") >= 0){
	        return attr.split(",")
	    } else {
	        //Especially in IE Edge, the parameters do not have to be split by commas, IE even replaces commas with spaces!
	        return attr.split(" ")
	    }
	};

	var parseScientific = function (numberString) {
	    var info = /([\d\.]+)e-(\d+)/i.exec(numberString);
	    if (!info) {
	        return parseFloat(numberString);
	    }

	    var num = info[1].replace('.', ''), numDecs = info[2] - 1;
	    var output = "0.";
	    for (var i = 0; i < numDecs; i++) {
	        output += "0";
	    }
	    output += num;
	    return parseFloat(output);
	}

	module.exports = SVGGraphics;


/***/ },
/* 1 */
/***/ function(module, exports) {

	if(typeof __WEBPACK_EXTERNAL_MODULE_1__ === 'undefined') {var e = new Error("Cannot find module \"undefined\""); e.code = 'MODULE_NOT_FOUND'; throw e;}
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