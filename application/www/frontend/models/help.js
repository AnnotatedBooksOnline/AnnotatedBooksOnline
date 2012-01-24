/*
 * Help model.
 */

Ext.define('Ext.ux.HelpModel', {
    extend: 'Ext.data.Model',
    fields: ['helpPageId','pageName','content'],
    idProperty: 'helpId',
    
    proxy: {
        type: 'requestmanager',
        controller: 'Help',
        model: 'Ext.ux.HelpModel'
    }
});

Ext.define('Ext.ux.HelpParagraphModel', {
   extend: 'Ext.data.Model',
   idProperty: 'helpParagraphId',
   fields: ['helpParagraphId','pageName','content'],
   belongsTo: 'Ext.ux.HelpModel',
   
   
    proxy: {
        type: 'requestmanager',
        controller: 'Help',
        model: 'Ext.ux.HelpModel'
        }
});

