/*
 * Scan model.
 */

Ext.define('Ext.ux.ScanModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'scanId',
    fields: ['scanId', 'bindingId', 'page', 'status', 'width', 'height', 'zoomLevel', 'uploadId', 'scanName', 'bookTitle'],
    
    /*
    hasMany: {
        model: 'Ext.ux.AnnotationModel',
        name: 'annotations',
        filterProperty: 'scanId'
    },*/
    
    proxy: {
        type: 'requestmanager',
        controller: 'Scan',
        model: 'Ext.ux.ScanModel'
    }
});

