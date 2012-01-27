/*
 * Binding language model.
 */

Ext.define('Ext.ux.BindingLanguageModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'languagegId',
    fields: ['languageName','bindingId','languageId'],

    proxy: {
        type: 'requestmanager',
        controller: 'BindingLanguage',
        model: 'Ext.ux.BindingLanguageModel'
    }
});
