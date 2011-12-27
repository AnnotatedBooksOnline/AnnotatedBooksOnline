/*
 * Annotation model.
 */

Ext.define('Ext.ux.VertexModel', {
    extend: 'Ext.ux.ModelBase',
    fields: ['x', 'y']
});

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'annId',
    fields: ['annId', 'scanId', /* -- */ 'eng', 'orig' /* -- */], // TODO: Rename to real names.
    
    hasMany: {
        model: 'Ext.ux.VertexModel',
        name: 'vertices'
    },
    
    // NOTE: text, etc.
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation',
        model: 'Ext.ux.AnnotationModel'
    }
});
