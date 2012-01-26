/*
 * Help model.
 */

Ext.define('Ext.ux.HelpModel', {
    extend: 'Ext.data.Model',
    fields: ['helpPageId','pageName','content','helpType'],
    idProperty: 'helpId',
    
    proxy: {
        type: 'requestmanager',
        controller: 'Help',
        model: 'Ext.ux.HelpModel'
    }
});
