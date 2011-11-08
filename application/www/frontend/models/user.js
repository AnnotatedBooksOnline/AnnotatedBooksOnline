/*
 * User model.
 */

Ext.define('Ext.ux.UserModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
       {name: 'userId'},
       {name: 'username'},
       {name: 'email'},
       {name: 'firstName'},
       {name: 'lastName'},
       {name: 'affiliation'},
       {name: 'occupation'},
       {name: 'website'}
    ],
    proxy: {
        type: 'requestmanager',
        controller: 'User'
    }
});
