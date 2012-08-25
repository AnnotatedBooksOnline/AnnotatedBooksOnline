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

PolygonOverlay.prototype.activePolygon;
PolygonOverlay.prototype.activeVertex;

// Constants.
PolygonOverlay.minimumVertexDistance = 5;

// Constructor.
PolygonOverlay.prototype.constructor = function(viewport)
{
    // Set members.
    this.polygons = [];
    this.viewport = viewport;
    this.mode     = 'view';
    
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
        var polygon = this.polygons[i];
        
        // Determine if visible.
        var visible = this.isPolygonVisible(polygon, area);
        if (visible !== polygon.isVisible())
        {
            if (visible)
            {
                polygon.show();
            }
            else
            {
                polygon.hide();
            }
        }
        
        // Update polygon.
        if (visible)
        {
            polygon.update(position, this.zoomFactor, rotation);
        }
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

PolygonOverlay.prototype.setPolygonMode = function(polygon, mode)
{
    polygon.setMode(mode);
    polygon.update(this.position, this.zoomFactor, this.rotation);
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
            
        case 'vertex':
            this.viewport.disable(true, false, false);
            break;
            
        case 'addvertex':
            this.viewport.disable(true, false, false);
            break;
            
        case 'erasevertex':
            this.viewport.disable(true, false, false);
            break;
            
        case 'erase':
            this.viewport.disable(true, false, false);
            break;
            
        default:
            throw new Error("Invalid polygon overlay mode given.");
    }
    
    if (this.newPolygon !== undefined)
    {
        // Do not trigger a remove, because it never really got created.
        this.removePolygon(this.newPolygon, false);
        
        this.newPolygon = undefined;
    }
    
    this.activePolygon = undefined;
    this.activeVertex  = undefined;
}

PolygonOverlay.prototype.getMode = function()
{
    return this.mode;
}

PolygonOverlay.prototype.setInvertHighlight = function(invert)
{
    for (var i = 0; i < this.polygons.length; i++)
    {
        this.polygons[i].setInvertHighlight(invert);
    }
}

/*
 * Protected methods.
 */

PolygonOverlay.prototype.isPolygonVisible = function(polygon, area)
{
    return boundingBoxesIntersect(polygon.getBoundingBox(), area);
}

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

PolygonOverlay.prototype.onVertexMove = function(polygon, vertex)
{
    // May be implemented by subclass.
}

PolygonOverlay.prototype.onVertexAdd = function(polygon, vertex)
{
    // May be implemented by subclass.
}

PolygonOverlay.prototype.onVertexRemove = function(polygon)
{
    // May be implemented by subclass.
}

PolygonOverlay.prototype.onPolygonClick = function(polygon)
{
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
    
    return true;
}

PolygonOverlay.prototype.onPolygonHover = function(polygon)
{
    // Highlight this polygon.
    polygon.highlight();
    
    return true;
}

PolygonOverlay.prototype.onPolygonUnhover = function(polygon)
{
    // Dehighlight this polygon.
    polygon.unhighlight();
    
    return true;
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
    this.dom.bind('selectstart',  false);
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
        // Check if previous vertex is not very close to this one.
        // This solved double and triple click problems.
        var squaredDistance = distanceSquared(
            this.newPolygon.getVertex(this.newPolygon.getVertexAmount() - 1),
            point
        ) * this.zoomFactor * this.zoomFactor;
        
        var mvd = PolygonOverlay.minimumVertexDistance;
        if (squaredDistance >= (mvd * mvd))
        {
            this.newPolygon.addVertex(point);
            this.newPolygon.update(this.position, this.zoomFactor, this.rotation);
        }
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
                _this.setPolygonMode(newPolygon, 'view');
                
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
            
            var newTopRight = {x: point.x, y: topLeft.y};
            var newBottomLeft = {x: topLeft.x, y: point.y};
            
            this.newPolygon.moveVertex(topRight, {x: point.x, y: topLeft.y});
            this.newPolygon.moveVertex(bottomLeft, {x: topLeft.x, y: point.y});
            this.newPolygon.moveVertex(bottomRight, point);
            
            retval = false;
        }
    }
    
    if (this.activePolygon !== undefined)
    {
        // Calculate point within overlay in viewport dimensions.
        var point = this.transformPoint({x: event.pageX, y: event.pageY});
        
        // Move vertex.
        this.activePolygon.moveVertex(this.activeVertex, point);
        
        // Trigger vertex move event.
        this.onVertexMove(this.activePolygon, this.activeVertex);
        
        retval = false;
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
    
    if (this.activePolygon !== undefined)
    {
        this.activePolygon = undefined;
        this.activeVertex  = undefined;
    }
    
    return retval;
}

PolygonOverlay.prototype.onVertexMouseDown = function(event, polygon, vertex)
{
    if (this.mode === 'vertex')
    {
        this.activePolygon = polygon;
        this.activeVertex  = vertex;
        
        return false;
    }
    
    return true;
}

PolygonOverlay.prototype.onVertexMouseUp = function(event, polygon, vertex)
{
    if (this.mode === 'erasevertex')
    {
        if (polygon.getVertexAmount() <= 3)
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
        else
        {
            // Remove vertex.
            polygon.removeVertex(vertex);
            
            // Trigger remove vertex event.
            this.onVertexRemove(polygon);
        }
        
        return false;
    }
    
    return true;
}

PolygonOverlay.prototype.onPolygonMouseDown = function(event, polygon)
{
    if ((this.mode === 'addvertex') && (polygon.getMode() === 'edit'))
    {
        // Calculate point within overlay in viewport dimensions.
        var point = this.transformPoint({x: event.getPageX(), y: event.getPageY()});
        
        // Get index where to insert vertex into polygon.
        // We use a simple approach to do this: we fetch the edge closest to the point,
        // And insert the new vertex there.
        var amount = polygon.getVertexAmount();
        var minSquaredDistance = Number.MAX_VALUE;
        var minEdgeIndex = -1;
        for (var i = amount - 1; i >= 0; --i)
        {
            // Get edge vertices.
            var previousIndex = ((i !== 0) ? i : amount) - 1;
            
            var first  = polygon.getVertex(previousIndex);
            var second = polygon.getVertex(i);
            
            // Calculate edge and vertex vectors.
            var edge   = {x: second.x - first.x, y: second.y - first.y};
            var vertex = {x: point.x  - first.x, y: point.y  - first.y};
            
            // Normalize edge, inlined here for usage of edge length later on.
            var edgeLength = length(edge);
            var edge = {x: edge.x / edgeLength, y: edge.y / edgeLength};
            
            // Calculate distance on edge  with dot product.
            var distanceOnEdge = dot(edge, vertex);
            
            // Check whether vertex occurs in range.
            if ((distanceOnEdge < 0) || (distanceOnEdge > edgeLength))
            {
                continue;
            }
            
            // Calculate point on edge that is closest to vertex.
            var edgePoint = {
                x: first.x + edge.x * distanceOnEdge,
                y: first.y + edge.y * distanceOnEdge
            };
            
            // Calculate squared distance to point.
            var squaredDistanceToEdgePoint = distanceSquared(point, edgePoint);
            if (squaredDistanceToEdgePoint < minSquaredDistance)
            {
                minSquaredDistance = squaredDistanceToEdgePoint;
                minEdgeIndex       = previousIndex;
            }
        }
        
        // Insert vertex at edge.
        var vertex = polygon.addVertex(point, minEdgeIndex);
        polygon.update(this.position, this.zoomFactor, this.rotation);
        
        // Set active polygon and vertex.
        this.activePolygon = polygon;
        this.activeVertex  = vertex;
        
        // Trigger add vertex event.
        this.onVertexAdd(polygon, vertex);
    }
    
    return true;
}
