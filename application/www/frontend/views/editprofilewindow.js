/* * Edit profile class. */Ext.define('Ext.ux.EditProfileForm', {    extend: 'Ext.ux.FormBase',    alias: 'widget.editprofileform',    requires: ['*'], // TODO: specify        initComponent: function()     {        var _this = this;                var defConfig = {            items: [{                name: 'username',                fieldLabel: 'Username',                value: 'thisisme',                minLength: 6,                maxLength: 40            },{                name: 'email',                fieldLabel: 'Email Address',                value: 'me@email.com',                vtype: 'email',                maxLength: 256            },{                name: 'firstname',                fieldLabel: 'First name',                value: 'Not',                allowBlank: true,                maxLength: 50            },{                name: 'lastname',                fieldLabel: 'Last name',                value: 'Me',                allowBlank: true,                maxLength: 50            },{                name: 'affiliation',                fieldLabel: 'Affiliation',                allowBlank: true,                maxLength: 50            },{                name: 'occupation',                fieldLabel: 'Occupation',                allowBlank: true,                maxLength: 50            },{                name: 'website',                fieldLabel: 'Website',                value: 'http://www.uu.nl/',                allowBlank: true,                vtype: 'url',                maxLength: 256            },{                name: 'password1',                fieldLabel: 'New password',                allowBlank: true,                inputType: 'password',                style: 'margin-top:15px'            },{                name: 'password2',                fieldLabel: 'Repeat password',                allowBlank: true,                inputType: 'password',                                // Custom validator implementation - checks that the value matches what was entered                // into the password1 field.                validator: function(value)                {                    var password1 = this.previousSibling('[name=password1]');                                        if(value === password1.getValue()) {                        if(value.length >= 8 || value.length === 0) {                            return true;                        } else {                            return 'Password needs to be 8 characters or longer.';                        }                    } else {                        return 'Passwords do not match.';                    }                }            }],                        buttons: [{                xtype: 'button',                formBind: true,                text: 'Update',                width: 140,                handler: function()                {                    var form = this.up('form').getForm();                    // TODO                    /*                     * Normally we would submit the form to the server here and handle the response                     * form.submit({                     *     clientValidation: true,                     *     url: 'editprofile.php',                     *     success: function(form, action) {                     *        //...                     *     },                     *     failure: function(form, action) {                     *         //...                     *     }                     * });                     */                    if (form.isValid())                    {                        Ext.Msg.alert('Submitted Values', form.getValues(true));                    }                }            }]        };                Ext.apply(this, defConfig);                this.callParent();    }});Ext.define('Ext.ux.EditProfileWindow', {    extend: 'Ext.window.Window',    initComponent: function()     {        var defConfig = {            title: 'Edit profile',            layout: 'fit',            width: 600,            height: 400,            closable: true,            resizable: true,            draggable: true,            modal: true,            border: true,            items: [{                xtype: 'editprofileform'            }]        };                Ext.apply(this, defConfig);                this.callParent();    }});/* * Edit profile class with propertygrid - changed my mind because of validation *//*Ext.define('Ext.ux.EditProfilePanel', {    extend: 'Ext.form.Panel',    alias: 'widget.editprofilepanel',    requires: ['*'],        initComponent: function()     {        var _this = this;                var defConfig = {            flex: 1,            items: [{                xtype: 'propertygrid',                propertyNames: {                    username: 'Username *',                    email: 'E-mail *',                    firstName: 'First name',                    lastName: 'Last name',                    affiliation: 'Affiliation',                    occupation: 'Occupation',                    website: 'Website'                },                // TODO: ajax request                source: {                    "username":"R3nz3",                    "email":"r3nz3@email.com",                    "firstName":"Renze",                    "lastName":"Nat",                    "affiliation":"",                    "occupation":"",                    "website":"http://www.uu.nl/"                },                hideHeaders : true            }],            buttons: [{                xtype: 'button',                text: 'Edit password',                width: 140,                handler: function()                {                    // TODO: handler                    // open new window to edit password                }            },{                xtype: 'button',                text: 'Update',                width: 140,                handler: function()                {                    // TODO: handler                }            }]        };                Ext.apply(this, defConfig);                this.callParent();    }});*/