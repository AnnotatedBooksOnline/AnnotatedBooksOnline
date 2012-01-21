/*
 * User model.
 */

Ext.define('Ext.ux.UserModel', {
    extend: 'Ext.ux.ModelBase',
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
       {name: 'active'},
       {name: 'banned'},
       {name: 'rank'},
       {name: 'activationStage'},
       {name: 'permissions'},
       
       // Passwords are needed for registration and profile. Not filled when fetching a user.
       {name: 'password'},
       {name: 'newPassword'}
    ],
    
    proxy: {
        type: 'requestmanager',
        controller: 'User',
        model: 'Ext.ux.UserModel'
    },
    
    getFullName: function()
    {
        return this.get('firstName') + ' ' + this.get('lastName');
    }
});
