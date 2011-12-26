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
    this.getPolygonByAnnotation(annotation).setMode('edit');
}

AnnotationOverlay.prototype.uneditAnnotation = function(annotation)
{
    this.getPolygonByAnnotation(annotation).setMode('view');
}

AnnotationOverlay.prototype.getAnnotationColor = function(annotation)
{
    return this.getPolygonByAnnotation(annotation).getHighlightColor();
}

AnnotationOverlay.prototype.setAnnotationColor = function(annotation, color)
{
    this.getPolygonByAnnotation(annotation).setHighlightColor(color);
}

/*
 * Private methods.
 */

AnnotationOverlay.prototype.update = function(position, zoomLevel, rotation, area)
{
    // Determine visibility of each polygon by area.
    // TODO: Implement.
    
    // Update polygons.
    AnnotationOverlay.base.update.call(this, position, zoomLevel, rotation, area);
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
    // TODO: Check area.
    
    succeed();
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
}

AnnotationOverlay.prototype.onPolygonClick = function(polygon)
{
    // Check for view mode.
    if (this.getMode() === 'view')
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
    this.eventDispatcher.trigger('hover', this, annotation);
}

AnnotationOverlay.prototype.onPolygonUnhover = function(polygon)
{
    // Get corresponding annotation.
    var annotation = this.getAnnotationByPolygon(polygon);
    
    // Trigger unhover event.
    this.eventDispatcher.trigger('unhover', this, annotation);
}