/*
 * Edit profile form class.
 */

Ext.define('Ext.ux.EditProfileForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.editprofileform',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                name: 'email',
                fieldLabel: 'Email Address',
                allowBlank: false,
                vtype: 'checkEmail',
                maxLength: 256
            },{
                name: 'firstName',
                fieldLabel: 'First name',
                allowBlank: false,
                maxLength: 50
            },{
                name: 'lastName',
                fieldLabel: 'Last name',
                allowBlank: false,
                maxLength: 50
            },{
                name: 'affiliation',
                fieldLabel: 'Affiliation',
                allowBlank: true,
                maxLength: 50,
                hidden: true
            },{
                name: 'occupation',
                fieldLabel: 'Occupation',
                allowBlank: true,
                maxLength: 50,
                hidden: true
            },{
                name: 'website',
                fieldLabel: 'Website',
                allowBlank: true,
                vtype: 'checkURL',
                maxLength: 256,
                hidden: true
            },{
                name: 'homeAddress',
                fieldLabel: 'Address',
                allowBlank: true,
                maxLength: 256,
                hidden: true
            },{
                name: 'password',
                fieldLabel: 'Current password',
                allowBlank: true,
                inputType: 'password',
                style: 'margin-top: 15px',
                minLength: 8,
                maxLength: 32,
                
                validator: function(value)
                {
                    var password          = _this.down('[name=password]');
                    var newPassword       = _this.down('[name=newPassword]');
                    var repeatNewPassword = _this.down('[name=repeatNewPassword]');
                    
                    // Set required fields.
                    var previousAllowBlank = password.allowBlank;
                    var newAllowBlank =
                        !(value || newPassword.getValue() || repeatNewPassword.getValue());
                    
                    if (previousAllowBlank != newAllowBlank)
                    {
                        password.allowBlank = repeatNewPassword.allowBlank = newPassword.allowBlank =
                            newAllowBlank;
                        
                        password.validate();
                        newPassword.validate();
                        repeatNewPassword.validate();
                    }
                    
                    return true;
                }
            },{
                name: 'newPassword',
                fieldLabel: 'New password',
                allowBlank: true,
                inputType: 'password',
                minLength: 8,
                maxLength: 32,
                
                validator: function(value)
                {
                    var password          = _this.down('[name=password]');
                    var newPassword       = _this.down('[name=newPassword]');
                    var repeatNewPassword = _this.down('[name=repeatNewPassword]');
                    
                    // Set required fields.
                    var previousAllowBlank = password.allowBlank;
                    var newAllowBlank =
                        !(password.getValue() || value || repeatNewPassword.getValue());
                    
                    if (previousAllowBlank != newAllowBlank)
                    {
                        password.allowBlank = repeatNewPassword.allowBlank = newPassword.allowBlank =
                            newAllowBlank;
                        
                        password.validate();
                        newPassword.validate();
                        repeatNewPassword.validate();
                    }
                    
                    return true;
                }
            },{
                name: 'repeatNewPassword',
                fieldLabel: 'Repeat password',
                allowBlank: true,
                inputType: 'password',
                
                validator: function(value)
                {
                    var password          = _this.down('[name=password]');
                    var newPassword       = _this.down('[name=newPassword]');
                    var repeatNewPassword = _this.down('[name=repeatNewPassword]');
                    
                    // Set required fields.
                    var previousAllowBlank = password.allowBlank;
                    var newAllowBlank =
                        !(password.getValue() || newPassword.getValue() || value);
                    
                    if (previousAllowBlank != newAllowBlank)
                    {
                        password.allowBlank = repeatNewPassword.allowBlank = newPassword.allowBlank =
                            newAllowBlank;
                        
                        password.validate();
                        newPassword.validate();
                        repeatNewPassword.validate();
                    }
                    
                    // Check whether our value matches the other new password field its value.
                    return (value === newPassword.getValue()) ? true : 'Passwords do not match.';
                }
            }],
            buttons: [{
                xtype: 'button',
                text: 'Cancel',
                iconCls: 'cancel-icon',
                width: 140,
                handler: function()
                {
                    Ext.WindowManager.each(
                        function(window)
                        {
                            if (window instanceof Ext.window.Window)
                                window.close();
                        }
                    );
                }
            },{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Save',
                iconCls: 'accept-icon',
                width: 140,
                handler: function()
                {
                    _this.submit();
                }
            }],
            
            model: Authentication.getInstance().getUserModel()
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        var form = this.getForm();
        if (form.isValid())
        {
            this.saveModel(this,
                function()
                {
                    // Fire model changed event.
                    Authentication.getInstance().modelChanged();
                    
                    // Close window above us, if any.
                    var window = this.up('window');
                    if (window)
                    {
                        window.close();
                    }
                }
            );
        }
    }
});

/*
 * Edit profile window class.
 */

Ext.define('Ext.ux.EditProfileWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Edit profile',
            layout: 'fit',
            width: 600,
            height: 400,
            items: [{
                xtype: 'editprofileform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
