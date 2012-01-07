/*
 * Author model.
 */

Ext.define('Ext.ux.AuthorModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'personId',
    fields: ['bookId','personId', 'name'],

    proxy: {
        type: 'requestmanager',
        controller: 'Author',
        model: 'Ext.ux.AuthorModel'
    }
});
