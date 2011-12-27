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

// Removes a polygon.
PolygonOverlay.prototype.removePolygon = function(polygon, triggerEvent)
{
    // Search for polygon.
    for (var i = this.polygons.length - 1; i >= 0; --i)
    {
        if (this.polygons[i] === polygon)
        {
            // Remove polygon from list.
            this.polygons.splice(i, 1);
            
            // Trigger polygon removal event.
            if (triggerEvent !== false)
            {
                this.onPolygonRemove(polygon);
            }
            
            // Destroy polygon.
            polygon.destroy();
            
            return;
        }
    }
}

PolygonOverlay.prototype.removePolygons = function(triggerEvent)
{
    for (var i = this.polygons.length - 1; i >= 0; --i)
    {
        var polygon = this.polygons[i];
        
        if (triggerEvent !== false)
        {
            this.onPolygonRemove(polygon);
        }
        
        polygon.destroy();
    }
    
    this.polygons = [];
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
        // Do not trigger a remove, because it never really got created.
        this.removePolygon(this.newPolygon, false);
        
        this.newPolygon = undefined;
    }
}

PolygonOverlay.prototype.getMode = function()
{
    return this.mode;
}

/*
 * Protected methods.
 */

PolygonOverlay.prototype.onBeforePolygonRemove = function(polygon, succeed, cancel)
{
    // May be implemented by subclass. Call succeed or cancel to go on.
    
    succeed();
}

PolygonOverlay.prototype.onPolygonRemove = function(polygon)
{
    // May be implemented by subclass.
}

PolygonOverlay.prototype.onBeforePolygonCreate = function(polygon, succeed, cancel)
{
    // May be implemented by subclass.
    
    succeed();
}

PolygonOverlay.prototype.onPolygonCreate = function(polygon)
{
    // May be implemented by subclass.
}

PolygonOverlay.prototype.onPolygonClick = function(polygon)
{
    // May be implemented by subclass.
    
    if (this.mode === 'erase')
    {
        // Check whether to succeed.
        var _this = this;
        this.onBeforePolygonRemove(polygon,
            function()
            {
                _this.removePolygon(polygon);
            },
            function()
            {
                // Do nothing.
            });
    }
}

/*
 * Private methods.
 */

PolygonOverlay.prototype.initialize = function()
{
    // Create draw component and get its surface.
    this.drawComponent = Ext.create('Ext.draw.Component', {
        width: '100%',
        height: '100%',
        viewBox: false,
        renderTo: this.dom.get(0)
    });
    
    this.surface = this.drawComponent.surface;
    
    // Set event listeners.
    var _this = this;
    this.dom.bind('dblclick',     function(event) { return _this.onDoubleClick(event); });
    this.dom.bind('mousedown',    function(event) { return _this.onMouseDown(event);   });
    this.dom.bind('contextmenu',  false);
    $(document).bind('mousemove', function(event) { return _this.onMouseMove(event);   });
    $(document).bind('mouseup',   function(event) { return _this.onMouseUp(event);     });
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
        // Set new polygon to undefined for new polygons.
        var newPolygon  = this.newPolygon;
        this.newPolygon = undefined;
        
        // Check whether to succeed.
        var _this = this;
        this.onBeforePolygonCreate(newPolygon,
            function()
            {
                // Keep polygon, set its mode and update it.
                newPolygon.setMode('view');
                newPolygon.update(_this.position, _this.zoomFactor, _this.rotation);
                
                // Call polygon create handler.
                _this.onPolygonCreate(newPolygon);
            },
            function()
            {
                _this.removePolygon(newPolygon, false);
            });
        
    }
}

/*
 * Event handlers.
 */

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
