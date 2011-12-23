/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Polygon class.
 */

// Class definition.
function Polygon()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Polygon.prototype.overlay;

Polygon.prototype.mode;

Polygon.prototype.content;
Polygon.prototype.lines;
Polygon.prototype.corners;

Polygon.prototype.vertices;
Polygon.prototype.aabb;
Polygon.prototype.surface;

// Constants.
Polygon.lineColor     = "#000";
Polygon.lineThickness = 1;
Polygon.vertexRadius  = 10;

/*
 * Public methods.
 */

// Constructor.
Polygon.prototype.constructor = function(overlay, vertices)
{
    // Set members.
    this.overlay  = overlay;
    this.vertices = vertices;
    this.mode     = 'view';
    this.color    = '0000FF';
    
    // Initialize.
    this.initialize();
}

Polygon.prototype.update = function(position, scale, rotation)
{
    if (this.mode !== 'create')
    {
        this.content.show();
        this.content.setAttributes({
            translate: {
                x: -position.x * scale,
                y: -position.y * scale
            },
            scale: {
                x: scale,
                y: scale,
                centerX: 0,
                centerY: 0
            },
            rotate: {
                x: 0,
                y: 0,
                degrees: rotation * (180 / Math.PI)
            }
        }, true);
    }
    else
    {
        this.content.hide(true);
    }
    
    this.lines.setAttributes({
        translate: {
            x: -position.x * scale,
            y: -position.y * scale
        },
        scale: {
            x: scale,
            y: scale,
            centerX: 0,
            centerY: 0
        },
        rotate: {
            x: 0,
            y: 0,
            degrees: rotation * (180 / Math.PI)
        },
        "stroke-width": Polygon.lineThickness / scale // TODO: Not for IE6/7/8?
    }, true);
    
    if (this.mode !== 'view')
    {
        for (var i = this.corners.length - 1; i >= 0; --i)
        {
            this.corners[i].show();
            this.corners[i].setAttributes({
                translate: {
                    x: -position.x * scale,
                    y: -position.y * scale
                },
                scale: {
                    x: scale,
                    y: scale,
                    centerX: 0,
                    centerY: 0
                },
                rotate: {
                    x: 0,
                    y: 0,
                    degrees: rotation * (180 / Math.PI)
                },
                radius: Polygon.vertexRadius / scale
            }, true);
        }
    }
    else
    {
        for (var i = this.corners.length - 1; i >= 0; --i)
        {
            this.corners[i].hide(true);
        }
    }
}

Polygon.prototype.addVertex = function(vertex)
{
    // Add vertex.
    this.vertices.push(vertex);
    
    // Calculate new bounding box and surface.
    this.aabb    = Polygon.calculateBoundingBox(this.vertices);
    this.surface = Polygon.calculateSurface(this.vertices);
    
    // Set new path.
    var path = Polygon.calculatePath(this.vertices, this.mode !== 'create');
    
    this.content.setAttributes({path: path});
    this.lines.setAttributes({path: path});
    
    // Add corner.
    this.addCorner(vertex);
}

Polygon.prototype.moveVertex = function(vertex, position)
{
    // Set new vertex position.
    vertex.x = position.x;
    vertex.y = position.y;
    
    // Calculate bounding box and surface.
    this.aabb    = Polygon.calculateBoundingBox(this.vertices);
    this.surface = Polygon.calculateSurface(this.vertices);
    
    // Set new path.
    var path = Polygon.calculatePath(this.vertices, this.mode !== 'create');
    
    this.content.setAttributes({path: path}, true);
    this.lines.setAttributes({path: path}, true);
    
    // Set new corner position.
    for (var i = this.vertices.length - 1; i >= 0; --i)
    {
        if (this.vertices[i] === vertex)
        {
            this.corners[i].setAttributes({x: position.x, y: position.y}, true);
            
            return;
        }
    }
}

Polygon.prototype.getVertex = function(index)
{
    return this.vertices[index];
}

Polygon.prototype.setMode = function(mode)
{
    // Set new mode.
    this.mode = mode;
    
    // Set new path.
    var path = Polygon.calculatePath(this.vertices, this.mode !== 'create');
    
    this.content.setAttributes({path: path}, true);
    this.lines.setAttributes({path: path}, true);
}

Polygon.prototype.getMode = function()
{
    return this.mode;
}

Polygon.prototype.getBoundingBox = function()
{
    return this.aabb;
}

Polygon.prototype.getVertexAmount = function()
{
    return this.vertices.length;
}

Polygon.prototype.destroy = function()
{
    this.content.destroy();
    this.lines.destroy();
    
    for (var i = this.corners.length - 1; i >= 0; --i)
    {
        this.corners[i].destroy();
    }
}

/*
 * Private methods.
 */

Polygon.prototype.initialize = function()
{
    // Calculate bounding box and surface.
    this.aabb    = Polygon.calculateBoundingBox(this.vertices);
    this.surface = Polygon.calculateSurface(this.vertices);
    
    // Create path.
    var path = Polygon.calculatePath(this.vertices, true);
    
    // Create content.
    var _this = this;
    this.content = this.overlay.surface.add({
        type: "path",
        path: path,
        stroke: "#000",
        fill: "none",
        opacity: 0.1,
        "stroke-width": 0,
        listeners: {
            'mouseover': function(s, event) { return _this.onMouseOver(event); },
            'mouseout':  function(s, event) { return _this.onMouseOut(event);  },
            'mousemove': function(s, event) { return _this.onMouseOver(event); },
            'click':     function(s, event) { return _this.onClick(event);     }
        }
    });
    
    // Add polygon class.
    this.content.show(true);
    this.content.addCls('polygon');
    
    // Create lines.
    this.lines = this.overlay.surface.add({
        type: "path",
        path: path,
        stroke: Polygon.lineColor,
        fill: "none",
        opacity: 1
    });
    
    //this.lines.show(true);
    
    // Create corners.
    this.corners = [];
    for (var i = 0; i < this.vertices.length; ++i)
    {
        this.addCorner(this.vertices[i]);
    }
}

Polygon.prototype.addCorner = function(vertex)
{
    // Add corner.
    var _this = this;
    var corner = this.overlay.surface.add({
        type: "circle",
        x: vertex.x,
        y: vertex.y,
        radius: Polygon.vertexRadius,
        fill: "#000",
        "stroke-width": 0,
        opacity: 1,
        listeners: {
            'mousedown': function(v, event)
            {
                _this.onMouseDown(vertex);
                
                event.stopEvent();
            }
        }
    });
    
    corner.show(true);
    corner.addCls('corner');
    
    this.corners.push(corner);
    
    return corner;
}

Polygon.prototype.onMouseOver = function()
{
    this.content.setAttributes({
        fill: this.color,
        opacity: .2,
    }, true);
}

Polygon.prototype.onMouseOut = function()
{
    this.content.setAttributes({
        fill: 'none',
        opacity: 0.1,
    }, true);
}

/*
 * Event handlers.
 */

// Handles click on the polygon.
Polygon.prototype.onClick = function(event)
{
    this.overlay.onPolygonClick(event, this);
}

// Handles mouse down on a vertex.
Polygon.prototype.onMouseDown = function(vertex)
{   
    // DEBUG: skip moving vertices for now..
    return;
    
    // Make us receive events.
    this.overlay.setActive(this);
    
    // Set active vertex.
    this.activeVertex = vertex;
    
    return false;
}

Polygon.prototype.onMouseMove = function(event)
{
    // Skip moving if there is no active vertex.
    if (this.activeVertex === undefined)
    {
        return;
    }
    
    // Calculate point within overlay in viewport dimensions.
    var point = this.overlay.transformPoint({x: event.pageX, y: event.pageY});
    
    // Move vertex.
    this.moveVertex(this.activeVertex, point);
    
    return false;
}

Polygon.prototype.onMouseUp = function(event)
{
    // Make us stop receiving events.
    this.overlay.setInactive(this);
    
    // Remove active vertex.
    delete this.activeVertex;
    
    return false;
}

/*
 * Statics.
 */

Polygon.calculateSurface = function(vertices)
{
    // Handle every vertex except first.
    var previous, current, surface = 0;
    for (var i = vertices.length - 1; i >= 1; --i)
    {
        previous = vertices[i - 1];
        current  = vertices[i];
        
        surface += previous.x * current.y - previous.y * current.x;
    }
    
    // Handle first vertex.
    previous = vertices[vertices.length - 1];
    current  = vertices[0];
    
    surface += previous.x * current.y - previous.y * current.x;
    
    // Return positive result.
    return Math.abs(surface * 0.5);
}

Polygon.calculateBoundingBox = function(vertices)
{
    var topLeft     = {x: vertices[0].x, y: vertices[0].y};
    var bottomRight = {x: vertices[0].x, y: vertices[0].y};
    
    for (var i = vertices.length - 1; i >= 1; --i)
    {
        var vertex = vertices[i];
        
        topLeft.x = Math.min(topLeft.x, vertex.x);
        topLeft.y = Math.min(topLeft.y, vertex.y);
        
        bottomRight.x = Math.max(bottomRight.x, vertex.x);
        bottomRight.y = Math.max(bottomRight.y, vertex.y);
    }
    
    return {topLeft: topLeft, bottomRight: bottomRight};
}

Polygon.calculatePath = function(vertices, close)
{
    var path = 'M';
    for (var i = vertices.length - 1; i >= 0; --i)
    {
        var vertex = vertices[i];
        
        path += vertex.x + ' ' + vertex.y + (i ? ' L' : (close ? ' Z' : ''));
    }
    
    return path;
}