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
                name: 'firstname',
                fieldLabel: 'First name',
                allowBlank: true,
                maxLength: 50
            },{
                name: 'lastname',
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
                name: 'password1',
                fieldLabel: 'New password',
                allowBlank: true,
                inputType: 'password',
                style: 'margin-top:15px'
            },{
                name: 'password2',
                fieldLabel: 'Repeat password',
                allowBlank: true,
                inputType: 'password',
                
                // Custom validator implementation - checks that the value matches what was entered
                // into the password1 field.
                validator: function(value)
                {
                    var password1 = this.previousSibling('[name=password1]');
                    
                    // TODO: add current password to change the password.
                    
                    if (value === password1.getValue())
                    {
                        if (value.length >= 8 || value.length === 0)
                        {
                            return true;
                        }
                        else
                        {
                            return 'Password needs to be 8 characters or longer.';
                        }
                    }
                    else
                    {
                        return 'Passwords do not match.';
                    }
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

