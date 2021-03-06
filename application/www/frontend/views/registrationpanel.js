/*
 * Registration form class.
 */

Ext.define('Ext.ux.RegistrationForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.registrationform',

    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                name: 'username',
                fieldLabel: 'Username *',
                vtype: 'checkUsername',
                //minLength: 6,
                maxLength: 30
            },{
                name: 'email',
                fieldLabel: 'Email address *',
                vtype: 'checkEmail',
                maxLength: 255
            },{
                name: 'firstName',
                fieldLabel: 'First name *',
                maxLength: 50
            },{
                name: 'lastName',
                fieldLabel: 'Last name *',
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
                vtype: 'checkURL',
                maxLength: 255
            },{
                name: 'homeAddress',
                fieldLabel: 'Address',
                allowBlank: true,
                maxLength: 555
            },{
                name: 'password',
                fieldLabel: 'Password *',
                inputType: 'password',
                style: 'margin-top: 15px',
                minLength: 8,
                maxLength: 32
            },{
                name: 'repeatPassword',
                fieldLabel: 'Repeat password *',
                inputType: 'password',
                
                // Custom validator implementation - checks that the value matches what was entered
                // into the repeat password field.
                validator: function(value)
                {
                    var password = this.previousSibling('[name=password]');
                    return (value === password.getValue()) ? true : 'Passwords do not match.';
                }
            },

            /* [DISABLED]
             * Terms of use acceptance checkbox. Two things are special about this checkbox:
             *
             * 1. The boxLabel contains a HTML link to the terms of use page; a special click listener opens this
             *    page in a modal Ext window for convenient viewing, and the decline and accept buttons in the window
             *    update the checkbox's state automatically.
             * 2. This checkbox is required, i.e. the form will not be able to be submitted unless the user has
             *    checked the box. Ext does not have this type of validation built in for checkboxes, so we have
             *    added this check to the submit button.
             */
           /*{
                xtype: 'checkboxfield',
                name: 'acceptTerms',
                fieldLabel: 'Terms of use',
                hideLabel: true,
                style: 'margin-top: 15px;',
                
                boxLabel: 'I have read and accept the <a href="#register" title="Show the terms of use"' +
                    'class="terms">terms of use</a>.',

                // Listener to open the terms of use page link in a modal window.
                listeners: {
                    click: {
                        element: 'boxLabelEl',
                        fn: function(e) { _this.showTerms(e); }
                    }
                }
            }*/],
            
            submitButtonText: 'Register',
            
            model: new Ext.ux.UserModel()
        };
        
        Ext.apply(this, defConfig);
        
        this.listeners = {
            // On validitychange, set the 'Register' button dis- or enabled (depending on validity)
            validitychange: function(comp, valid) {
                this.down('button').setDisabled(!valid);
            }
        };
        
        this.callParent();
    },
    
    showTerms: function(e)
    {
        var target = e.getTarget('.terms');
        
        if (target)
        {
            RequestManager.getInstance().request('Setting', 'getSetting', {setting: 'terms-of-use'}, this,
                function(termsOfUse)
                {
                    var _this = this;
                    
                    var window = Ext.widget('window', {
                        title: 'Terms of use',
                        modal: true,
                        width: 600,
                        height: 400,
                        bodyPadding: 10,
                        autoScroll: true,
                        html: termsOfUse,
                        
                        buttons: [{
                            text: 'Decline',
                            iconCls: 'cancel-icon',
                            handler: function()
                            {
                                this.up('window').close();
                                _this.down('[name=acceptTerms]').setValue(false);
                            }
                        },{
                            text: 'Accept',
                            iconCls: 'accept-icon',
                            handler: function()
                            {
                                this.up('window').close();
                                _this.down('[name=acceptTerms]').setValue(true);
                            }
                        }]
                    });
                    
                    window.show();
                    e.preventDefault();
                }
            );
        }
    },
    
    submit: function()
    {
        // Terms of use are disabled..
        /*if (!this.down('[name=acceptTerms]').getValue())
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Please accept the terms of use.',
                icon: Ext.Msg.ERROR,
                buttons: Ext.Msg.OK
            });
            
            return;
        }*/
        
        var form = this.getForm();
        if (form.isValid())
        {
            this.saveModel(
                this,
                function()
                {
                    this.up('registrationpanel').onAfterRegistration(this.getModel());
                },
                function(data)
                {
                    Ext.MessageBox.alert('Registration failed',
                        'Something went wrong while registering. Please try again later.');
                }
            );
        }
    }
});

/*
 * Registration panel class.
 */

Ext.define('Ext.ux.RegistrationPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.registrationpanel',

    initComponent: function() 
    {
        var defConfig = {
            layout: 'card',
            activeItem: 0,
            items: [{
                xtype: 'registrationform'
            },{
                html: '',
                bodyPadding: 10
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    onAfterRegistration: function(model)
    {
        var item = this.items.get(1);
        
        item.update('Welcome to ' + document.title + ', ' + escape(model.getFullName()) + '.<br/>' +
                    'You should soon receive an e-mail with instructions on how to activate your account.');
        
        this.getLayout().setActiveItem(1);
    }
});
