/*
 * Annotation model.
 */

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.data.Model',
    idProperty: 'annId',
    fields: ['annId', 'scanId'],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation',
        model: 'Ext.ux.AnnotationModel'
    }
});

/*
 * Scan model.
 */

Ext.define('Ext.ux.ScanModel', {
    extend: 'Ext.data.Model',
    idProperty: 'scanId',
    fields: ['scanId', 'bookId', 'index', 'status', 'width', 'height', 'zoomLevels'],

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

/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.data.Model',
    idProperty: 'bookId',
    fields: ['bookId', 'bindingId', 'title', 'minYear', 'maxYear', 'publisher'],

    hasMany: {
        model: 'Ext.ux.ScanModel',
        name: 'scans',
        filterProperty: 'bookId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Book',
        model: 'Ext.ux.BookModel'
    }
});

/*
 * Binding model.
 */

Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['bindingId', 'title'],

    hasMany: {
        model: 'Ext.ux.BookModel',
        name: 'books',
        filterProperty: 'bindingId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Binding',
        model: 'Ext.ux.BindingModel'
    }
});
