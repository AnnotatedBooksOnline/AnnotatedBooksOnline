/*
 * Scan model.
 */

Ext.define('Ext.ux.ScanModel', {
    extend: 'Ext.data.Model',
    idProperty: 'scanId',
    fields: ['scanId', 'bookId', 'index', 'status', 'width', 'height', 'zoomLevel'], // TODO: zoomLevel[s].
    
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
