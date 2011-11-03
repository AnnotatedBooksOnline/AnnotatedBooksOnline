/*
 * Registration window class.
 */

Ext.define('Ext.ux.RegistrationForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.registrationform',
    requires: ['*'], // TODO: specify

    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                name: 'username',
                fieldLabel: 'Username',
                vtype: 'uniqueUsername',
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
                fieldLabel: 'Password',
                inputType: 'password',
                style: 'margin-top:15px',
                minLength: 8
            },{
                name: 'password2',
                fieldLabel: 'Repeat password',
                inputType: 'password',
                
                // Custom validator implementation - checks that the value matches what was entered
                // into the password1 field.
                validator: function(value)
                {
                    var password1 = this.previousSibling('[name=password1]');
                    return (value === password1.getValue()) ? true : 'Passwords do not match.'
                }
            },
            
            // TODO: CAPTCHA

            /*
             * Terms of Use acceptance checkbox. Two things are special about this:
             * 1) The boxLabel contains a HTML link to the Terms of Use page; a special click listener opens this
             *    page in a modal Ext window for convenient viewing, and the Decline and Accept buttons in the window
             *    update the checkbox's state automatically.
             * 2) This checkbox is required, i.e. the form will not be able to be submitted unless the user has
             *    checked the box. Ext does not have this type of validation built in for checkboxes, so we add a
             *    custom getErrors method implementation.
             */
            {
                xtype: 'checkboxfield',
                name: 'acceptTerms',
                fieldLabel: 'Terms of Use',
                hideLabel: true,
                style: 'margin-top: 15px',
                boxLabel: 'I have read and accept the <a href="http://www.sencha.com/legal/terms-of-use/" class="terms">Terms of Use</a>.',

                // Listener to open the Terms of Use page link in a modal window.
                listeners: {
                    click: {
                        element: 'boxLabelEl',
                        fn: function(e)
                        {
                            var target = e.getTarget('.terms');
                            
                            if (target)
                            {
                                var win = Ext.widget('window', {
                                    title: 'Terms of Use',
                                    modal: true,
                                    width: 500,
                                    height: 400,
                                    html: '<iframe src="' + target.href + '" style="border: 0;'
                                        + 'width: 100%; height: 100%;"></iframe>',
                                    buttons: [{
                                        text: 'Decline',
                                        handler: function()
                                        {
                                            this.up('window').close();
                                            _this.down('[name=acceptTerms]').setValue(false);
                                        }
                                    },{
                                        text: 'Accept',
                                        handler: function()
                                        {
                                            this.up('window').close();
                                            _this.down('[name=acceptTerms]').setValue(true);
                                        }
                                    }]
                                });
                                
                                win.show();
                                e.preventDefault();
                            }
                        }
                    }
                },

                // Custom validation logic - requires the checkbox to be checked.
                // getErrors: function()
                // {
                //     return this.getValue() ? [] : ['Please accept the terms of use.']
                // }
            }],
            
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Register',
                width: 140,
                handler: function()
                {
                    var form = this.up('form').getForm();
                    
                    if (!this.up('form').down('[name=acceptTerms]').getValue())
                    {
                        Ext.Msg.show({
                            title: 'Error',
                            msg: 'Please accept the Terms of Use.',
                            icon: Ext.Msg.ERROR,
                            buttons: Ext.Msg.OK
                        });
                        
                        return;
                    }
                    
                    if (form.isValid())
                    {
                        _this.saveModel();
                    }
                }
            }],
            
            model: new Ext.ux.UserModel()
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.RegistrationWindow', {
    extend: 'Ext.window.Window',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Register an account',
            layout: 'fit',
            width: 600,
            height: 400,
            closable: true,
            resizable: true,
            draggable: true,
            modal: true,
            border: true,
            items: [{
                xtype: 'registrationform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

// TODO: not working yet + should move to somewhere else
Ext.apply(Ext.form.VTypes, {
    uniqueUsername: function(value, field) {
        // TODO: ajax request with database
        /*
        var username = ..;
        
        var response = Ext.Ajax.request({
            url: 'uniqueUsername.php',
            method: 'POST',
            params: 'username='+username,
            succes: ...
        });
        
        return response;*/
        
        return true;
    },
    
    uniqueUsernameText: 'Username already in use'
});
