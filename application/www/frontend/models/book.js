/*
 * Binding model.
 */

/*
Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.data.Model',
    idProperty: 'bindingId',
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
*/

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
