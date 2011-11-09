/*
 * Edit profile class.
 */

Ext.define('Ext.ux.EditProfileForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.editprofileform',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                name: 'username',
                fieldLabel: 'Username',
                minLength: 6,
                maxLength: 40
            },{
                name: 'email',
                fieldLabel: 'Email Address',
                vtype: 'email',
                maxLength: 256
            },{
                name: 'firstName',
                fieldLabel: 'First name',
                allowBlank: true,
                maxLength: 50
            },{
                name: 'lastName',
                fieldLabel: 'Last name',
                allowBlank: true,
                maxLength: 50
            },{
                name: 'affiliation',
                fieldLabel: 'Affiliation',
                allowBlank: true,
                maxLength: 50
            },{
                name: 'occupation',
                fieldLabel: 'Occupation',
                allowBlank: true,
                maxLength: 50
            },{
                name: 'website',
                fieldLabel: 'Website',
                allowBlank: true,
                vtype: 'url',
                maxLength: 256
            },{
                name: 'password',
                fieldLabel: 'Current password',
                allowBlank: true,
                inputType: 'password',
                style: 'margin-top: 15px',
                minLength: 8,
                maxLength: 32
            },{
                name: 'newPassword',
                fieldLabel: 'New password',
                allowBlank: true,
                inputType: 'password',
                minLength: 8,
                maxLength: 32
            },{
                name: 'repeatnewpassword',
                fieldLabel: 'Repeat password',
                allowBlank: true,
                inputType: 'password',
                
                // Custom validator implementation - checks that the value matches what was entered
                // into the new password field.
                validator: function(value)
                {
                    var password = this.previousSibling('[name=newPassword]');
                    return (value === password.getValue()) ? true : 'Passwords do not match.';
                }
            }],
            
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Update',
                width: 140,
                handler: function()
                {
                    var form = _this.getForm();
                    if (form.isValid())
                    {
                        _this.saveModel(_this,
                            function()
                            {
                                var window = this.up('window');
                                if (window)
                                {
                                    window.close();
                                }
                            });
                    }
                }
            }],
            
            model: Ext.ux.UserModel,
            modelId: Authentication.getInstance().getUserId()
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.EditProfileWindow', {
    extend: 'Ext.window.Window',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Edit profile',
            layout: 'fit',
            width: 600,
            height: 400,
            closable: true,
            resizable: true,
            draggable: true,
            modal: true,
            border: true,
            items: [{
                xtype: 'editprofileform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

