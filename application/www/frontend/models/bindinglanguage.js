/*
 * Binding language model.
 */

Ext.define('Ext.ux.BindingLanguageModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'bindingId',
    fields: ['bindingId','languageId'],

    proxy: {
        type: 'requestmanager',
        controller: 'BindingLanguage',
        model: 'Ext.ux.BindingLanguageModel'
    }
});
