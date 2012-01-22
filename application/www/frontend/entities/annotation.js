/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Annotation class.
 */

// Class definition.
function Annotation()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Annotation.prototype.model;

// Constructor.
Annotation.prototype.constructor = function(model)
{
    // Set members.
    this.model = model;
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Annotation.createFromId = function(annotationId, obj, onSuccess, onError)
{
    // On success, create entity.
    var successCallback = function(model)
        {
            var annotation = new Annotation(model);
            
            onSuccess.call(this, annotation);
        };
    
    Ext.ux.AnnotationModel.load(annotationId, {
        scope: obj,
        success: successCallback,
        failure: onError
    });
}

Annotation.createFromVertices = function(vertices)
{
    // Create annotation model.
    var model = Ext.create('Ext.ux.AnnotationModel', {
        transcriptionOrig: '',
        transcriptionEng: ''
    });
    
    // Add vertices.
    for (var i = 0; i < vertices.length; ++i)
    {
        model.polygon().add({x: vertices[i].x, y: vertices[i].y});
    }
    
    return new Annotation(model);
}

Annotation.prototype.setVertices = function(vertices)
{
    // Set vertices.
    this.model.polygon().removeAll();
    for (var i = 0; i < vertices.length; ++i)
    {
        this.model.polygon().add({x: vertices[i].x, y: vertices[i].y});
    }
}

Annotation.prototype.getId = function()
{
    return this.model.get('annotationId');
}

Annotation.prototype.getVertices = function()
{
    var vertexRecords = this.model.polygon().data.items;
    var vertices = [];
    for (var i = 0; i < vertexRecords.length; ++i)
    {
        var vertex = vertexRecords[i].data;
        
        vertices.push({x: vertex.x, y: vertex.y});
    }
    
    return vertices;
}

Annotation.prototype.getModel = function()
{
    return this.model;
}

Annotation.newId = 0;
Annotation.prototype.getHash = function()
{
    // Check for existing hash.
    if (this.hash === undefined)
    {
        // Check for new annotations.
        var annotationId = this.model.get('annotationId');
        if (annotationId)
        {
            this.hash = 'ann-' + annotationId;
        }
        else
        {
            this.hash = 'new-ann' + (++Annotation.newId);
        }
    }
    
    return this.hash;
}

/*
 * Private methods.
 */

Annotation.prototype.initialize = function()
{
    ;
}
