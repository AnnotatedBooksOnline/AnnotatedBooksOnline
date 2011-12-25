/*
 * Annotation model.
 */

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.data.Model',
    idProperty: 'annotationId',
    fields: ['annotationId', 'scanId'],
    
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

/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.data.Model',
    idProperty: 'bookId',
    fields: ['bookId', 'bindingId', 'title', 'minYear', 'maxYear', 'author', 'languages', 'publisher', 'placePublished'],

    proxy: {
        type: 'requestmanager',
        controller: 'Book',
        model: 'Ext.ux.BookModel'
    },
    
    getTimePeriod: function()
    {
        if (this.get('minYear') == this.get('maxYear'))
        {
            return this.get('minYear');
        }
        return this.get('minYear') + ' - ' + this.get('maxYear');
    }
});

/*
 * Binding model.
 */

Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.data.Model',
    idProperty: 'bindingId',
    fields: ['bindingId', 'library', 'signature', 'provenance', 'languagesOfAnnotations'],

    hasMany: {
        model: 'Ext.ux.BookModel',
        name: 'books',
        filterProperty: 'bindingId'
    },

    hasMany: {
        model: 'Ext.ux.ScanModel',
        name: 'scans',
        filterProperty: 'bindingId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Binding',
        model: 'Ext.ux.BindingModel'
    }
});

