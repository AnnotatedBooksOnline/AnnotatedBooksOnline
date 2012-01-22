/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'bookId',
    fields: ['bookId', 'bindingId', 'title', 'minYear', 'maxYear', 'author', 'languages', 'publisher', 'placePublished', 'version'],
    
    hasMany: [{
        model: 'Ext.ux.AuthorModel',
        name: 'authors',
        filterProperty: 'bookId'
    },{
        model: 'Ext.ux.BookLanguageModel',
        name: 'bookLanguages',
        filterProperty: 'bookId'
    }],
    
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
