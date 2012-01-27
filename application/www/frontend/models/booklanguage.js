/*
 * Book language model.
 */

Ext.define('Ext.ux.BookLanguageModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'languageId',
    fields: ['languageName','bookId','languageId'],

    proxy: {
        type: 'requestmanager',
        controller: 'BookLanguage',
        model: 'Ext.ux.BookLanguageModel'
    }
});
