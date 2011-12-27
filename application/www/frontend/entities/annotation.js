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
Annotation.prototype.annId;

// Constructor.
Annotation.prototype.constructor = function(model)
{
    // Set members.
    this.model = model;
    this.annId = model.get('annId');
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Annotation.createFromId = function(annId, obj, onSuccess, onError)
{
    // On success, create entity.
    var successCallback = function(model)
        {
            var annotation = new Annotation(model);
            
            onSuccess.call(this, annotation);
        };
    
    Ext.ux.AnnotationModel.load(annId, {
        scope: obj,
        success: successCallback,
        failure: onError
    });
}

Annotation.createFromVertices = function(vertices)
{
    var model = Ext.create('Ext.ux.AnnotationModel', {
        vertices: vertices // TODO: Maybe clone them.
    });
    
    return new Annotation(model);
}

Annotation.prototype.getId = function()
{
    return this.annId;
}

Annotation.prototype.getVertices = function()
{
    var vertexRecords = this.model.vertices().data.items;
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
        if (this.annId)
        {
            this.hash = 'ann-' + this.annId;
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
