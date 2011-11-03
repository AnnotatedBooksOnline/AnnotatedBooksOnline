/*
 * User model.
 */

Ext.define('Ext.ux.UserModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
       {name: 'id'},
       {name: 'username'},
       {name: 'email'},
       {name: 'firstname'},
       {name: 'lastname'},
       {name: 'affiliation'},
       {name: 'occupation'},
       {name: 'website'}
    ],
    proxy: {
        type: 'requestmanager',
        controller: 'User'
    }
});
