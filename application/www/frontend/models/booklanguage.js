/*
 * Book language model.
 */

Ext.define('Ext.ux.BookLanguageModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'bookId',
    fields: ['bookId','languageId'],

    proxy: {
        type: 'requestmanager',
        controller: 'BookLanguage',
        model: 'Ext.ux.BookLanguageModel'
    }
});
