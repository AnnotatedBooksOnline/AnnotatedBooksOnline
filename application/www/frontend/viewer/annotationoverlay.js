/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Annotation overlay class.
 *
 * Knows everything about the connection between polygons and annotations.
 */

// Class definition.
function AnnotationOverlay(viewport)
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

AnnotationOverlay.prototype = new PolygonOverlay;
AnnotationOverlay.base = PolygonOverlay.prototype;

// Fields.
AnnotationOverlay.prototype.eventDispatcher;

AnnotationOverlay.prototype.annotationsByPolyId;
AnnotationOverlay.prototype.polygonsByAnnHash;

// Constants.
AnnotationOverlay.minimumPolygonArea = 100;

// Constructor.
AnnotationOverlay.prototype.constructor = function(viewport)
{
    // Set members.
    this.eventDispatcher = new EventDispatcher();
    
    this.annotationsByPolyId = {};
    this.polygonsByAnnHash   = {};
    
    // Create overlay.
    AnnotationOverlay.base.constructor.call(this, viewport);
}

/*
 * Public methods.
 */

AnnotationOverlay.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

AnnotationOverlay.prototype.getAnnotationByPolygon = function(polygon)
{
    return this.annotationsByPolyId[polygon.getId()];
}

AnnotationOverlay.prototype.getPolygonByAnnotation = function(annotation)
{
    return this.polygonsByAnnHash[annotation.getHash()];
}

AnnotationOverlay.prototype.clear = function()
{
    // Remove polygons. Don't trigger events.
    this.removePolygons(false);
    
    // Reset members.
    this.annotationsByPolyId = {};
    this.polygonsByAnnHash   = {};
}

AnnotationOverlay.prototype.addAnnotation = function(annotation, editMode, color)
{
    // Create polygon.
    var polygon = this.addPolygon(annotation.getVertices(), editMode ? 'edit' : 'view');
    
    // Set color.
    if (color !== undefined)
    {
        polygon.setHighlightColor(color);
    }
    
    // Create references.
    this.annotationsByPolyId[polygon.getId()]    = annotation;
    this.polygonsByAnnHash[annotation.getHash()] = polygon;
}

AnnotationOverlay.prototype.removeAnnotation = function(annotation)
{
    // Remove polygon. Do not trigger an event.
    this.removePolygon(this.getPolygonByAnnotation(annotation), false);
}

AnnotationOverlay.prototype.highlightAnnotation = function(annotation)
{
    this.getPolygonByAnnotation(annotation).highlight();
}

AnnotationOverlay.prototype.unhighlightAnnotation = function(annotation)
{
    this.getPolygonByAnnotation(annotation).unhighlight();
}

AnnotationOverlay.prototype.editAnnotation = function(annotation)
{
    this.setPolygonMode(this.getPolygonByAnnotation(annotation), 'edit');
}

AnnotationOverlay.prototype.uneditAnnotation = function(annotation)
{
    this.setPolygonMode(this.getPolygonByAnnotation(annotation), 'view');
}

AnnotationOverlay.prototype.getAnnotationColor = function(annotation)
{
    return this.getPolygonByAnnotation(annotation).getHighlightColor();
}

AnnotationOverlay.prototype.setAnnotationColor = function(annotation, color)
{
    this.getPolygonByAnnotation(annotation).setHighlightColor(color);
}

// Sets mode. Mode can be: 'view', 'polygon', 'rectangle', 'erase'.
AnnotationOverlay.prototype.setMode = function(mode)
{
    AnnotationOverlay.base.setMode.call(this, mode);
    
    // Trigger create event.
    this.eventDispatcher.trigger('modechange', this, mode);
}

/*
 * Private methods.
 */

AnnotationOverlay.prototype.isPolygonVisible = function(polygon, area)
{
    // Fetch polygon area, squaring here because its in R^2.
    var polygonArea = polygon.getArea() * this.zoomFactor * this.zoomFactor;
    
    // Check polygon area.
    var enoughArea = (polygonArea >= AnnotationOverlay.minimumPolygonArea);
    
    // Check mode.
    var editMode = (polygon.getMode() !== 'view')
    
    return editMode ||
        enoughArea && AnnotationOverlay.base.isPolygonVisible.call(this, polygon, area);
}

AnnotationOverlay.prototype.onBeforePolygonRemove = function(polygon, succeed, cancel)
{
    // Ask for confirmation.
    Ext.Msg.confirm('Are you sure?', 'Are you sure you want to remove this annotation?',
        function(button)
        {
            if (button === 'no')
            {
                cancel();
            }
            else
            {
                succeed();
            }
        });
}

AnnotationOverlay.prototype.onPolygonRemove = function(polygon)
{
    // Trigger erase event.
    var annotation = this.annotationsByPolyId[polygon.getId()];
    this.eventDispatcher.trigger('erase', this, annotation);
    
    // Delete annotation reference.
    delete this.annotationsByPolyId[polygon.getId()];
    
    // Delete polygon reference.
    delete this.polygonsByAnnHash[annotation.getHash()];
}

AnnotationOverlay.prototype.onBeforePolygonCreate = function(polygon, succeed, cancel)
{
    // Fetch polygon area, squaring here because its in R^2.
    var polygonArea = polygon.getArea() * this.zoomFactor * this.zoomFactor;
    
    // Succeed or cancel depending on the area.
    if (polygonArea >= AnnotationOverlay.minimumPolygonArea)
    {
        succeed();
    }
    else
    {   
        cancel();
        
        // Show a nice message.
        Ext.Msg.show({
            msg: 'Creating the annotation failed: it did not have enough area.',
            title: 'Annotation creation failed.',
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        });
    }
}

AnnotationOverlay.prototype.onPolygonCreate = function(polygon)
{
    // Create annotation.
    var annotation = Annotation.createFromVertices(polygon.getVertices());
    
    // Create references.
    this.annotationsByPolyId[polygon.getId()]    = annotation;
    this.polygonsByAnnHash[annotation.getHash()] = polygon;
    
    // Trigger create event.
    this.eventDispatcher.trigger('create', this, annotation);
    
    // Set view mode.
    this.setMode('view');
}

AnnotationOverlay.prototype.onPolygonClick = function(polygon)
{
    // Check mode.
    var mode = this.getMode();
    if ((mode === 'view') || (mode === 'vertex') || (mode === 'addvertex') || (mode === 'erasevertex'))
    {
        // Get corresponding annotation.
        var annotation = this.getAnnotationByPolygon(polygon);
        
        // Trigger select event.
        this.eventDispatcher.trigger('select', this, annotation);
    }
    
    AnnotationOverlay.base.onPolygonClick.call(this, polygon);
}

AnnotationOverlay.prototype.onPolygonHover = function(polygon)
{
    // Get corresponding annotation.
    var annotation = this.getAnnotationByPolygon(polygon);
    
    // Trigger hover event.
    if (annotation !== undefined)
    {
        this.eventDispatcher.trigger('hover', this, annotation);
    }
    
    AnnotationOverlay.base.onPolygonHover.call(this, polygon);
}

AnnotationOverlay.prototype.onPolygonUnhover = function(polygon)
{
    // Get corresponding annotation.
    var annotation = this.getAnnotationByPolygon(polygon);
    
    // Trigger unhover event.
    if (annotation !== undefined)
    {
        this.eventDispatcher.trigger('unhover', this, annotation);
    }
    
    AnnotationOverlay.base.onPolygonUnhover.call(this, polygon);
}