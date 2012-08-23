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
    fields: ['annotationId',
             'scanId',
             'transcriptionEng',
             'transcriptionOrig',
             'order',
             'createdName',
             'changedName',
             {  name: 'timeCreated',
                type: 'date',
                dateFormat: 'Y-m-d'},
             {  name: 'timeChanged',
                type: 'date',
                dateFormat: 'Y-m-d'}
            ],
    
    hasMany: {
        model: 'Ext.ux.VertexModel',
        name: 'polygon'
    },
    
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation',
        model: 'Ext.ux.AnnotationModel'
    }
});

