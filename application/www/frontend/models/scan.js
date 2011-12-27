/*
 * Scan model.
 */

Ext.define('Ext.ux.ScanModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'scanId',
    fields: ['scanId', 'bindingId', 'pageNumber', 'status', 'width', 'height', 'zoomLevel', 'uploadId'],
    
    hasMany: {
        model: 'Ext.ux.AnnotationModel',
        name: 'annotations',
        filterProperty: 'scanId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Scan',
        model: 'Ext.ux.ScanModel'
    }
});

