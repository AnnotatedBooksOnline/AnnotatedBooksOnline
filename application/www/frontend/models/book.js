/*
 * Annotation model.
 */

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['id', 'pageId'],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation'
    }
});

/*
 * Page model.
 */

Ext.define('Ext.ux.PageModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['id', 'bookId', 'index'],

    hasMany: {
        model: 'Ext.ux.AnnotationModel',
        name : 'annotations',
        filterProperty: 'pageId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Page'
    }
});

/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['id', 'bindingId', 'title'],

    hasMany: {
        model: 'Ext.ux.PageModel',
        name : 'pages',
        filterProperty: 'bookId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Book'
    }
});

/*
 * Binding model.
 */

Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: ['id', 'title'],

    hasMany: {
        model: 'Ext.ux.BookModel',
        name : 'books',
        filterProperty: 'bindingId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Binding'
    }
});
