/*
 * Annotation model.
 */

Ext.define('Ext.ux.VertexModel', {
    extend: 'Ext.data.Model',
    fields: ['x', 'y']
});

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.data.Model',
    idProperty: 'annotationId',
    fields: ['annotationId', 'scanId', 'transcriptionEng', 'transcriptionOrig', 'order'],
    
    hasMany: {
        model: 'Ext.ux.VertexModel',
        name: 'polygon'
    },
    
    // NOTE: text, etc.
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation',
        model: 'Ext.ux.AnnotationModel'
    }
});

