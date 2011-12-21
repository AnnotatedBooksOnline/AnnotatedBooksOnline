/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Polygon overlay class.
 *
 * Manages polygons and handles drawing and creating polygons.
 */

// Class definition.
function PolygonOverlay()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

PolygonOverlay.prototype = new Overlay;
PolygonOverlay.base = Overlay.prototype;

// Fields.
PolygonOverlay.prototype.viewport;

PolygonOverlay.prototype.drawComponent;
PolygonOverlay.prototype.surface;

PolygonOverlay.prototype.mode;

PolygonOverlay.prototype.polygons;
PolygonOverlay.prototype.activePolygons;
PolygonOverlay.prototype.newPolygon;

//NOTE: should we have some state? like current position, rotation, etc?

// Constants.
//PolygonOverlay.abc = 10;

// Constructor.
PolygonOverlay.prototype.constructor = function(viewport)
{
    // Set members.
    this.polygons       = [];
    this.activePolygons = [];
    this.viewport       = viewport;
    this.mode           = 'view';
    
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

PolygonOverlay.prototype.addPolygon = function(vertices, mode, update)
{
    var polygon = new Polygon(this, vertices);
    
    this.polygons.push(polygon);
    
    if (mode !== undefined)
    {
        polygon.setMode(mode);
    }
    
    if (update !== false)
    {
        polygon.update(this.position, this.zoomFactor, this.rotation);
    }
    
    return polygon;
}

PolygonOverlay.prototype.removePolygon = function(polygon)
{
    for (var i = this.polygons.length - 1; i >= 0; --i)
    {
        if (this.polygons[i] === polygon)
        {
            this.polygons.splice(i, 1);
            
            polygon.destroy();
            
            return;
        }
    }
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

// Sets mode. Mode can be: 'view', 'polygon', 'rectangle', 'erase'.
PolygonOverlay.prototype.setMode = function(mode)
{
    this.mode = mode;
    
    switch (mode)
    {
        case 'view':
            this.viewport.enable();
            break;
            
        case 'polygon':
            this.viewport.disable(true, false, false);
            break;
            
        case 'rectangle':
            this.viewport.disable(true, false, false);
            break;
            
        case 'erase':
            this.viewport.disable(true, false, false);
            break;
    }
    
    if (this.newPolygon !== undefined)
    {
        this.removePolygon(this.newPolygon);
        
        this.newPolygon = undefined;
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
    
    //*
    
    var vertices = [{x: 10, y: 10}, {x: 60, y: 50}, {x: 110, y: 10}, {x: 110, y: 110}, {x: 60, y: 150}, {x: 10, y: 110}];
    var polygon = this.addPolygon(vertices, undefined, false);
    
    polygon.setMode('edit');
    
    
    
    var vertices = [{x: 122, y: 152}, {x: 130, y: 152}, {x: 130, y: 160}, {x: 122, y: 160}];
    this.addPolygon(vertices, undefined, false);
    
    //*/
    
    
    
    
    
    
    //set event listeners
    var _this = this;
    this.dom.bind('click',        function(event) { return _this.onClick(event);       });
    this.dom.bind('dblclick',     function(event) { return _this.onDoubleClick(event); });
    this.dom.bind('mousedown',    function(event) { return _this.onMouseDown(event);   });
    this.dom.bind('contextmenu',  false);
    $(document).bind('mousemove', function(event) { return _this.onMouseMove(event);   });
    $(document).bind('mouseup',   function(event) { return _this.onMouseUp(event);     });
    
    
    //this.dom.bind('mousedown',     function(event) { _this.startDragging(event); });
    //$(document).bind('keydown',    function(event) { _this.handleKeyDown(event); });
    //$(document).bind('keyup',      function(event) { _this.handleKeyUp(event);   });
    
    
    
    
    
    
    
}

PolygonOverlay.prototype.addVertex = function(event)
{
    // Calculate point within overlay in viewport dimensions.
    var point = this.transformPoint({x: event.pageX, y: event.pageY});
    
    // Create new polygon, or add vertex.
    if (this.newPolygon === undefined)
    {
        this.newPolygon = this.addPolygon([point], 'create');
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
        this.newPolygon.update(this.position, this.zoomFactor, this.rotation);
        
        this.newPolygon = undefined;
    }
}

/*
 * Event handlers.
 */

PolygonOverlay.prototype.onClick = function(event)
{
    if (this.mode !== 'view')
    {
        ;
    }
}

PolygonOverlay.prototype.onPolygonClick = function(event, polygon)
{
    if (this.mode === 'erase')
    {
        this.removePolygon(polygon);
    }
}

PolygonOverlay.prototype.onDoubleClick = function(event)
{
    if (this.mode !== 'view')
    {
        this.endPolygon();
        
        return false;
    }
}

PolygonOverlay.prototype.onMouseMove = function(event)
{
    var retval = true;
    
    if (this.mode === 'rectangle')
    {
        if (this.newPolygon !== undefined)
        {
            // Calculate point within overlay in viewport dimensions.
            var point = this.transformPoint({x: event.pageX, y: event.pageY});
            
            var topLeft     = this.newPolygon.getVertex(0);
            var topRight    = this.newPolygon.getVertex(1);
            var bottomRight = this.newPolygon.getVertex(2);
            var bottomLeft  = this.newPolygon.getVertex(3);
            
            this.newPolygon.moveVertex(topRight, {x: point.x, y: topLeft.y});
            this.newPolygon.moveVertex(bottomRight, point);
            this.newPolygon.moveVertex(bottomLeft, {x: topLeft.x, y: point.y});
            
            retval = false;
        }
    }
    
    for (var i = this.activePolygons.length - 1; i >= 0; --i)
    {
        retval = retval && this.activePolygons[i].onMouseMove(event);
    }
    
    return retval;
}

PolygonOverlay.prototype.onMouseDown = function(event)
{
    if (this.mode === 'rectangle')
    {
        // Calculate point within overlay in viewport dimensions.
        var point = this.transformPoint({x: event.pageX, y: event.pageY});
        
        // Create new polygon.
        var vertices = [point, clonePoint(point), clonePoint(point), clonePoint(point)];
        
        this.newPolygon = this.addPolygon(vertices, 'edit');
        
        return false;
    }
    
    //var retval = true;
    //for (var i = this.activePolygons.length - 1; i >= 0; --i)
    //{
    //    retval = retval && this.activePolygons[i].onMouseDown(event);
    //}
    
    //return retval;
}

PolygonOverlay.prototype.onMouseUp = function(event)
{
    var retval = true;
    
    if (this.mode === 'polygon')
    {
        if (event.which === 3)
        {
            this.endPolygon();
        }
        else
        {
            this.addVertex(event);
        }
        
        retval = false;
    }
    else if (this.mode === 'rectangle')
    {
        this.endPolygon();
        
        retval = false;
    }
    
    for (var i = this.activePolygons.length - 1; i >= 0; --i)
    {
        retval = retval && this.activePolygons[i].onMouseUp(event);
    }
    
    return retval;
}
