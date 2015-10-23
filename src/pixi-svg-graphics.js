/* @flow weak */

var PIXI = require('PIXI')
var color2color = require('./vendor/color2color')

function SVGGraphics(svg) {
    PIXI.Graphics.call(this);
    this._scale = 1;
    this._svg = svg;
    this._wt = new PIXI.Matrix();
    this._classes = {};
    this._trans = {'x': 0, 'y': 0};
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
        if (distance < this.lineDashLength) {
            this.currentPath.shape.points.push(x, y);
        } else {
            var segments = this.lineDashLength / distance;
            var dashOn = false;
            var pX, pY;
            for (var i = segments; i <= 1; i += segments) {
                var t = Math.max(Math.min(i, 1), 0);
                var x = fromX + (t * (x - fromX));
                var y = fromY + (t * (y - fromY));
                pX = x;
                pY = y;
                dashOn = !dashOn;
                if (dashOn) {
                    this.currentPath.shape.points.push(pX, pY);
                } else {
                    this.moveTo([pX, pY]);
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
                this.moveTo([nPx, nPy]);
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
                this.moveTo([nPx, nPy]);
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

SVGGraphics.prototype.updateTransform = function () {
    PIXI.DisplayObject.prototype.updateTransform.call(this);

    var wt = this.worldTransform;
    var scaleX = 1;
    var scaleY = 1;
    var tx = wt.tx;
    var ty = wt.ty;

    scaleX = Math.sqrt(Math.pow(wt.a, 2) + Math.pow(wt.b, 2));
    scaleY = Math.sqrt(Math.pow(wt.c, 2) + Math.pow(wt.d, 2));

    wt.scale(scaleX !== 0 ? 1 / scaleX : 0, scaleY !== 0 ? 1 / scaleY : 0);
    wt.tx = tx;
    wt.ty = ty;


    var scaleChanged = this._lastScaleX != scaleX || this._lastScaleY != scaleY;
    if (this.dirtyScale || scaleChanged) {
        this.graphicsDataOrg = this.graphicsDataOrg || [];
        for (var i = this.graphicsDataOrg.length; i < this.graphicsData.length; i++) {
            this.graphicsDataOrg.push(this.graphicsData[i].clone());
        }


        for (var i = 0; i < this.graphicsDataOrg.length; i++) {
            var pointsOrg = this.graphicsDataOrg[i].shape.points;
            var points = this.graphicsData[i].shape.points;
            if (points) {
                for (var p = 0; p < points.length; p += 2) {
                    points[p] = pointsOrg[p] * scaleX;
                    points[p + 1] = pointsOrg[p + 1] * scaleY;
                }
            }

            /*

             var gd = this.graphicsData[i];
             if(!gd._lineWidth) {
             gd._lineWidth = gd.lineWidth;
             }
             if(this._nonScaling) {
             gd.lineWidth = gd._lineWidth * this._scale;
             }


             */

        }
        this.dirtyScale = false;
    }
    this._lastScaleX = scaleX;
    this._lastScaleY = scaleY;
}


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
    var children = node.children;
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
    var font = styles_obj['font-size'] + " " + styles_obj['font-family'];
    var fill = styles_obj['fill'];
    var tspan = node.childNodes[0];
    var text = tspan.innerHTML;
    var pixi_text = new PIXI.Text(text, {font: font, fill: fill});
    pixi_text.x = node.getAttribute('x');
    pixi_text.y = node.getAttribute('y');
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
    var lastControl = {x: 0, y: 0};
    var lastCoord = {x: 0, y: 0};
    var subpathIndex = 0;

    for (var i = 0; i < instructions.length; i++) {
        var command = instructions[i].command;
        var args = instructions[i].args;
        var points = instructions[i].points;
        var z = 0;
        var fill = true;
        while (z < points.length) {
            switch (command.toLowerCase()) {
                // moveto command
                case 'm':
                    var x = points[z].x + this._trans.x;
                    var y = points[z].y + this._trans.y;

                    //check if we need to create "holes"
                    var lastDirection;
                    var direction = lastDirection = data.subpaths[subpathIndex].direction;
                    if (subpathIndex > 0) {
                        lastDirection = data.subpaths[subpathIndex - 1].direction;
                        if (direction != lastDirection) {
                            fill = false;
                        }
                    }

                    if (z == 0 && fill) {
                        this.moveTo(x, y);
                        this.graphicsData[this.graphicsData.length - 1].shape.closed = false;
                    } else {
                        this.lineTo2(x, y);
                    }
                    z += 1;
                    break;
                // lineto command
                case 'l':
                    var x = points[z].x + this._trans.x;
                    var y = points[z].y + this._trans.y;

                    this.lineTo2(x, y);
                    z += 1;
                    break;
                // curveto command
                case 'c':
                    this.bezierCurveTo2(
                        points[z].x + this._trans.x,
                        points[z].y + this._trans.y,
                        points[z + 1].x + this._trans.x,
                        points[z + 1].y + this._trans.y,
                        points[z + 2].x + this._trans.x,
                        points[z + 2].y + this._trans.y
                    );
                    lastCoord = points[z + 2];
                    z += 3;
                    break;
                // vertial lineto command
                case 'v':
                    var x = points[z].x + this._trans.x;
                    var y = points[z].y + this._trans.y;

                    this.lineTo2(x, y);
                    z += 1;
                    break;
                // horizontal lineto command
                case 'h':
                    var x = points[z].x + this._trans.x;
                    var y = points[z].y + this._trans.y;

                    this.lineTo2(x, y);
                    lastCoord.x = x;
                    z += 1;
                    break;
                // quadratic curve command
                case 's':
                    this.bezierCurveTo2(
                        points[z].x + this._trans.x,
                        points[z].y + this._trans.y,
                        points[z + 1].x + this._trans.x,
                        points[z + 1].y + this._trans.y,
                        points[z + 2].x + this._trans.x,
                        points[z + 2].y + this._trans.y
                    );
                    z += 3;
                    break;
                // closepath command
                case 'z':
                    z += 1;
                    subpathIndex += 1;
                    this.graphicsData[this.graphicsData.length - 1].shape.closed = true;
                    // Z command is handled by M
                    break;
                default:
                    throw new Error('Could not handle path command: ' + command + ' ' + args.join(','));
            }
            if (this.graphicsData[this.graphicsData - 1]) {
                this.graphicsData[this.graphicsData - 1]._lineWidth = this._lineWidth;
            }
        }
    }
}

SVGGraphics.prototype.tokenizePathData = function (pathData) {
    var commands = pathData.match(/[a-df-z][^a-df-z]*/ig);
    var data = {
        instructions: [],
        subpaths: []
    };

    //needed to calculate absolute position of points
    var lastPoint = {
        x: 0,
        y: 0
    };
    var lastControl = {
        x: 0,
        y: 0
    }
    var subpaths = [];
    var subpath = {
        points: [],
        direction: ''
    };
    for (var i = 0; i < commands.length; i++) {
        var instruction = {
            command: '',
            points: []
        };
        var command = commands[i][0];
        var args = [];

        //allow any decimal number in normal or scientific form
        args = args.concat(commands[i].slice(1).trim().match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g));
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
                    subpath.points.push(point);
                    lastPoint = point;
                    p += 2;
                    break;
                case 'l':
                    var point = {};
                    point.x = parseScientific(args[p]) + offset.x;
                    point.y = parseScientific(args[p + 1]) + offset.y;
                    points.push(point);
                    subpath.points.push(point);
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
                    subpath.points.push(point1);
                    subpath.points.push(point2);
                    subpath.points.push(point3);
                    lastPoint = point3;
                    lastControl = point2;
                    p += 6;
                    break;
                case 'v':
                    var point = {};
                    point.y = parseScientific(args[p]) + offset.y;
                    point.x = lastPoint.x;
                    points.push(point);
                    subpath.points.push(point);
                    lastPoint = point;
                    p += 1;
                    break;
                case 'h':
                    var point = {};
                    point.x = parseScientific(args[p]) + offset.x;
                    points.push(point);
                    subpath.points.push(point);
                    lastPoint = point;
                    p += 1;
                    break;
                case 's':
                    var point1 = {} , point2 = {}, point3 = {};
                    point1.x = 2 * lastPoint.x - lastControl.x;
                    point1.y = 2 * lastPoint.y - lastControl.y;
                    point2.x = parseScientific(args[p]) + offset.x;
                    point2.y = parseScientific(args[p + 1]) + offset.y;
                    point3.x = parseScientific(args[p + 2]) + offset.x;
                    point3.y = parseScientific(args[p + 3]) + offset.y;
                    points.push(point1);
                    points.push(point2);
                    points.push(point3);
                    lastPoint = point3;
                    lastControl = point2;
                    subpath.points.push(point1);
                    subpath.points.push(point2);
                    subpath.points.push(point3);
                    p += 4;
                    break;
                case 'z':
                    points.push({x: 0, y: 0});
                    //subpath is closed so we need to push the subpath
                    subpath.direction = this.getPathDirection(subpath);
                    subpaths.push(subpath);
                    subpath = {
                        points: []
                    };
                    p += 1;
                    break;
            }
            instruction.points = instruction.points.concat(points);
        }
        instruction.command = command;
        data.instructions.push(instruction);
    }

    //If path data ends with no z command, then we need to push the last subpath
    if (subpath.points.length > 0) {
        subpath.direction = this.getPathDirection(subpath);
        subpaths.push(subpath);
    }
    data.subpaths = subpaths;
    return data;
}

SVGGraphics.prototype.getPathDirection = function (path) {
    //based on http://stackoverflow.com/a/1584377
    var points = path.points;
    var sum = 0;
    for (var i = 0; i < points.length - 1; i++) {
        var curPoint = points[i];
        var nexPoint = points[(i + 1)];
        sum += (nexPoint.x - curPoint.x) * (nexPoint.y + curPoint.y);
    }
    if (sum > 0) {
        //clockwise
        return 'cw';
    } else {
        //counter-clockwise
        return 'ccw';
    }
}

SVGGraphics.prototype.applyTransformation = function (node) {
    if (node.getAttribute('transform')) {
        var transformMatrix = new PIXI.Matrix();
        var transformAttr = node.getAttribute('transform').trim().split('(');
        var transformCommand = transformAttr[0];
        var transformValues = transformAttr[1].replace(')', '').split(',');
        if (transformCommand == 'matrix') {
            transformMatrix.a = parseScientific(transformValues[0]);
            transformMatrix.b = parseScientific(transformValues[1]);
            transformMatrix.c = parseScientific(transformValues[2]);
            transformMatrix.d = parseScientific(transformValues[3]);
            transformMatrix.tx = parseScientific(transformValues[4]);
            transformMatrix.ty = parseScientific(transformValues[5]);
            var point = {x: 0, y: 0};
            var trans_point = transformMatrix.apply(point);
            this._trans.x += trans_point.x;
            this._trans.y += trans_point.y;
            this.scale.x = Math.sqrt(transformMatrix.a * transformMatrix.a + transformMatrix.b * transformMatrix.b);
            this.scale.y = Math.sqrt(transformMatrix.c * transformMatrix.c + transformMatrix.d * transformMatrix.d);

            this.rotation = -Math.acos(transformMatrix.a / this.scale.x);
        } else if (transformCommand == 'translate') {
            this._trans.x += parseScientific(transformValues[0]);
            this._trans.y += parseScientific(transformValues[1]);
        } else if (transformCommand == 'scale') {
            this.scale.x = parseScientific(transformValues[0]);
            this.scale.y = parseScientific(transformValues[1]);
        } else if (transformCommand == 'rotate') {
            if (transformValues.length > 1) {
                this._trans.x += parseScientific(transformValues[1]);
                this._trans.y += parseScientific(transformValues[2]);
            }

            this.rotation = parseScientific(transformValues[0]);

            if (transformValues.length > 1) {
                this._trans.x -= parseScientific(transformValues[1]);
                this._trans.y -= parseScientific(transformValues[2]);
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
        strokeDashLength = parseFloat(attributes['stroke-dasharray'].split(',')[0]);
        strokeSpaceLength = parseFloat(attributes['stroke-dasharray'].split(',')[1]);
        strokeDashed = true;
    }
    this.lineSegments = strokeSegments;
    this.lineDashed = strokeDashed;
    this.lineDashLength = strokeDashLength;
    this.lineSpaceLength = strokeSpaceLength;

    this.lineStyle(strokeWidth, strokeColor, strokeAlpha);

    // Apply fill style
    var fillColor = 0x000000, fillAlpha = 0;
    if (attributes.fill) {
        color = color2color(attributes.fill, 'array');
        intColor = 256 * 256 * color[0] + 256 * color[1] + color[2];
        fillColor = intColor;
        fillAlpha = color[3];

        this.beginFill(fillColor, fillAlpha);
    }
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
