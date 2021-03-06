/*
 * Binding model.
 */

Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'bindingId',
    fields: ['bindingId', 'library', 'signature', 'provenance', 'languagesOfAnnotations', 'status', 'userId'],
    
    hasMany: [{
        model: 'Ext.ux.BookModel',
        name: 'books',
        filterProperty: 'bindingId'
    },{
        model: 'Ext.ux.ScanModel',
        name: 'scans',
        filterProperty: 'bindingId'
    },{
        model: 'Ext.ux.ProvenanceModel',
        name: 'provenances',
        filterProperty: 'bindingId'
    },{
        model: 'Ext.ux.BindingLanguageModel',
        name: 'bindingLanguages',
        filterProperty: 'bindingId'
    }],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Binding',
        model: 'Ext.ux.BindingModel'
    }
});
