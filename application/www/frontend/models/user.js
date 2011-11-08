/*
 * User model.
 */

Ext.define('Ext.ux.UserModel', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
       {name: 'userId'},
       {name: 'username'},
       {name: 'password'}, // Password is needed for registration. Not filled when fetching a user.
       {name: 'email'},
       {name: 'firstName'},
       {name: 'lastName'},
       {name: 'affiliation'},
       {name: 'occupation'},
       {name: 'website'},
       {name: 'homeAddress'},
       {name: 'rank'}
    ],
    proxy: {
        type: 'requestmanager',
        controller: 'User'
    }
});
