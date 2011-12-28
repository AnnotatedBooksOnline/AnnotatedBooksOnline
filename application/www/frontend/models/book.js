/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'bookId',
    fields: ['bookId', 'bindingId', 'title', 'minYear', 'maxYear', 'author', 'languages', 'publisher', 'placePublished', 'firstPage', 'lastPage'],

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
