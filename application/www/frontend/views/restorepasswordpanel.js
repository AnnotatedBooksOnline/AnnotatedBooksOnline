
/*
 * Password restoration form.
 */
Ext.define('Ext.ux.RestorePasswordForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.restorepasswordform',
    
    initComponent: function() 
    {  
        var _this = this;
        
        var defConfig = {
                title : 'Enter a new password',
                items: [{
                    name: 'password',
                    fieldLabel: 'New password *',
                    inputType: 'password',
                    style: 'margin-top: 10px',
                    minLength: 8,
                    maxLength: 32
                },{
                    name: 'repeatPassword',
                    fieldLabel: 'Repeat password *',
                    inputType: 'password',
                    
                    validator: function(value)
                    {
                        var password = this.previousSibling('[name=password]');
                        return (value === password.getValue()) ? true : 'Passwords do not match.';
                    }
                }],
                
                submitButtonText: 'Ok',
                
                submit: function()
                {
                    var form = this.getForm();
                    
                    // Determine token and newly entered password.
                    var token = _this.up('restorepasswordpanel').tabInfo.data[0];
                    var newpass = form.getValues()['password'];
                    
                    // After changing was succesfull.
                    var onSuccess = function()
                    {
                        Ext.MessageBox.alert('Changing password succesfull.',
                                'Your password has been succesfully changed.' +
                                ' You can now log in with it.',
                                function()
                                {
                                    var tabs = Application.getInstance().viewport.getTabsInfo();
                                    for (var i = 0; i < tabs.length; i++)
                                    {
                                        if (tabs[i].type == 'restorepass')
                                        {
                                            Application.getInstance().viewport.closeTab(i);
                                        }
                                    }
                                });
                    };
                    
                    // If it failed (because e.g. the token was incorrect).
                    var onFailure = function()
                    {
                        Ext.MessageBox.alert('Changing password failed.',
                              'Something went wrong while trying to change your password.' +
                              ' Please make sure the address in your address bar matches the one in' + 
                              ' the e-mail you received.');
                    };
                    
                    // Do a request to change the password.
                    if(form.isValid())
                    {
                        RequestManager.getInstance().request(
                                'User',
                                'changeForgottenPassword',
                                {
                                    password: newpass,
                                    token: token
                                },
                                _this,
                                function(success)
                                {
                                    if(success)
                                    {
                                        onSuccess();
                                    }
                                    else
                                    {
                                        onFailure();
                                    }
                                },
                                function(data)
                                {
                                    onFailure();
                                }
                        );
                    }
                },
                
                model: new Ext.ux.UserModel()
            };
        
        Ext.apply(this, defConfig);
        this.callParent();
    }
});

/*
 * Password restoration panel.
 */
Ext.define('Ext.ux.RestorePasswordPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.restorepasswordpanel',
    
    initComponent: function() 
    {  
        // Send request with token from URL.
        var _this = this;
                
        var defConfig =
        {
            title: 'Restore password',
            layout: 'hbox',
            bodyPadding: 10,
            items: [{
                border: false,
                plain: true,
                flex: 1
            },{
                xtype: 'restorepasswordform',
                border: false,
                width: 400,
                height: 150
            },{
                border: false,
                plain: true,
                flex: 1
            }]
        }
        
        Ext.apply(_this, defConfig);
        this.callParent();
    }
    
});
