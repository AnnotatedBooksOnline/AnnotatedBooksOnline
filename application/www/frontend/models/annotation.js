/*
 * Annotation model.
 */

Ext.define('Ext.ux.VertexModel', {
    extend: 'Ext.data.Model',
    fields: ['x', 'y']
});

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.data.Model',
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
