/*
 * User model.
 */

Ext.define('Ext.ux.UserModel', {
    extend: 'Ext.data.Model',
    idProperty: 'userId',
    fields: [
       {name: 'userId'},
       {name: 'username'},
       {name: 'email'},
       {name: 'firstName'},
       {name: 'lastName'},
       {name: 'affiliation'},
       {name: 'occupation'},
       {name: 'website'},
       {name: 'homeAddress'},
       {name: 'rank'},
       
       // Passwords are needed for registration and profile. Not filled when fetching a user.
       {name: 'password'},
       {name: 'newPassword'},
    ],
    proxy: {
        type: 'requestmanager',
        controller: 'User'
    },
    
    getFullName: function()
    {
        return this.get('firstName') + ' ' + this.get('lastName');
    }
});