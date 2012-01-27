/*
 * Language model.
 */

Ext.define('Ext.ux.LanguageModel', {
    extend: 'Ext.data.ModelBase',
    idProperty: 'languageId',
    fields: ['languageName','languageId'],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Language',
        model: 'Ext.ux.LanguageModel'
    }
});

