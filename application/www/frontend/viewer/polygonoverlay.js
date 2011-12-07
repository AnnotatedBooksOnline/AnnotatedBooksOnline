/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Polygon overlay class.
 */

// Class definition.
function PolygonOverlay()
{
    //if (arguments.length)
        this.constructor.apply(this, arguments);
}

PolygonOverlay.prototype = new Overlay;
PolygonOverlay.base = Overlay.prototype;

// Fields.
PolygonOverlay.prototype.drawComponent;
PolygonOverlay.prototype.surface;

PolygonOverlay.prototype.polygons;
PolygonOverlay.prototype.activePolygons;
PolygonOverlay.prototype.newPolygon;

//NOTE: should we have some state? like current position, rotation, etc?

// Constants.
//PolygonOverlay.abc = 10;

// Constructor.
PolygonOverlay.prototype.constructor = function()
{
    // Set members.
    this.polygons       = [];
    this.activePolygons = [];
    
    // Create overlay.
    PolygonOverlay.base.constructor.call(this);
}

/*
 * Public methods.
 */

PolygonOverlay.prototype.update = function(position, zoomLevel, rotation, area)
{
    PolygonOverlay.base.update.apply(this, arguments);
    
    for (var i = this.polygons.length - 1; i >= 0; --i)
    {
        this.polygons[i].update(position, this.zoomFactor, rotation);
    }
}

PolygonOverlay.prototype.addPolygon = function(vertices, update)
{
    var polygon = new Polygon(this, vertices);
    
    this.polygons.push(polygon);
    
    if (update !== false)
    {
        polygon.update(this.position, this.zoomFactor, this.rotation);
    }
    
    return polygon;
}

PolygonOverlay.prototype.setActive = function(polygon)
{
    this.setInactive(polygon);
    this.activePolygons.push(polygon);
}

PolygonOverlay.prototype.setInactive = function(polygon)
{
    for (var i = this.activePolygons.length - 1; i >= 0; --i)
    {
        if (this.activePolygons[i] === polygon)
        {
            this.activePolygons.splice(i, 1);
            
            return;
        }
    }
}

/*
 * Private methods.
 */

PolygonOverlay.prototype.initialize = function()
{
    
    
    
    
    this.drawComponent = Ext.create('Ext.draw.Component', {
        width: '100%',
        height: '100%',
        viewBox: false,
        renderTo: this.dom.get(0)
    });
    
    this.surface = this.drawComponent.surface;
    
    var vertices = [{x: 10, y: 10}, {x: 60, y: 50}, {x: 110, y: 10}, {x: 110, y: 110}, {x: 60, y: 150}, {x: 10, y: 110}];
    var polygon = this.addPolygon(vertices, false);
    
    polygon.setMode('edit');
    
    
    
    var vertices = [{x: 122, y: 152}, {x: 130, y: 152}, {x: 130, y: 160}, {x: 122, y: 160}];
    this.addPolygon(vertices, false);
    
    
    
    
    
    
    
    
    //set event listeners
    var _this = this;
    this.dom.bind('click',        function(event) { _this.onClick(event);       });
    this.dom.bind('dblclick',     function(event) { _this.onDoubleClick(event); });
    this.dom.bind("contextmenu",  false);
    
    $(document).bind('mousemove', function(event) { _this.onMouseMove(event);   });
    $(document).bind('mousedown', function(event) { _this.onMouseDown(event);   });
    $(document).bind('mouseup',   function(event) { _this.onMouseUp(event);     });
    
    
    //this.dom.bind('mousedown',     function(event) { _this.startDragging(event); });
    //$(document).bind('keydown',    function(event) { _this.handleKeyDown(event); });
    //$(document).bind('keyup',      function(event) { _this.handleKeyUp(event);   });
    
    
    
    
    
    
    
}

PolygonOverlay.prototype.onClick = function(event)
{
    // NOTE: Only in 'createpolygon' mode.
    
    
}

PolygonOverlay.prototype.onDoubleClick = function(event)
{
    this.endPolygon();
}

PolygonOverlay.prototype.onMouseMove = function(event)
{
    var retval = true;
    for (var i = this.activePolygons.length - 1; i >= 0; --i)
    {
        retval = retval && this.activePolygons[i].onMouseMove(event);
    }
    
    return retval;
}

PolygonOverlay.prototype.onMouseDown = function(event)
{
    //var retval = true;
    //for (var i = this.activePolygons.length - 1; i >= 0; --i)
    //{
    //    retval = retval && this.activePolygons[i].onMouseDown(event);
    //}
    
    //return retval;
}

PolygonOverlay.prototype.onMouseUp = function(event)
{
    if (event.which === 3)
    {
        this.endPolygon();
    }
    else
    {
        this.addVertex(event);
    }
    
    var retval = true;
    for (var i = this.activePolygons.length - 1; i >= 0; --i)
    {
        retval = retval && this.activePolygons[i].onMouseUp(event);
    }
    
    return retval;
}

PolygonOverlay.prototype.addVertex = function(event)
{
    // Calculate point within overlay in viewport dimensions.
    var point = this.transformPoint({x: event.pageX, y: event.pageY});
    
    // Create new polygon, or add vertex.
    if (this.newPolygon === undefined)
    {
        this.newPolygon = this.addPolygon([point], false); // setMode already updates..
        this.newPolygon.setMode('create');
    }
    else
    {
        this.newPolygon.addVertex(point);
        this.newPolygon.update(this.position, this.zoomFactor, this.rotation);
    }
}

PolygonOverlay.prototype.endPolygon = function()
{
    if ((this.newPolygon !== undefined) && (this.newPolygon.getVertexAmount() >= 3))
    {
        this.newPolygon.setMode('edit');
        this.newPolygon = undefined;
    }
}


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
    
    //return;
    
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
            'mouseover': function() { _this.onMouseOver(); },
            'mouseout':  function() { _this.onMouseOut();  },
            'mousemove': function() { _this.onMouseOver(); },
            'click':     function() { _this.onClick();     }
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
            'mousedown': function(event)
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

// Handles click on the polygon.
Polygon.prototype.onClick = function()
{
    //alert('Clicked me!');
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










/*


getBBox(): x, y, width, height


Overlay has:

- mode (view / create)
    - view: all polygones are filled, 

Polygon has:

- surface
- vertices
- bounding box: {topLeft, bottomRight}



new Polygon(surface, vertices); // vertices: [{x: .., y: ..}, ..]



- update(   mode, position, zoomLevel, rotation   );
    - view mode: filled
    - edit mode: filled, dots are bigger
    - 

- onclick event
- 

*/