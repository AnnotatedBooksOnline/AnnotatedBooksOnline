/*
 * Login window class.
 */

Ext.define('Ext.ux.LoginForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.loginform',
    requires: ['*'], // TODO: specify

    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            items: [{
                name: 'username',
                fieldLabel: 'Username',
                minLength: 6
            },{
                name: 'password',
                fieldLabel: 'Password',
                inputType: 'password',
                minLength: 8
            }],
            
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Login',
                width: 140,
                handler: function()
                {
                    var form = this.up('form').getForm();

                    if (form.isValid())
                    {
                        var values = form.getValues();
                        
                        Authentication.getInstance().login(values.username, values.password, function()
                            {
                                this.up('window').close();
                            },
                            function(code, message, trace)
                            {
                                // TODO: Some error handling.
                            },
                            this);
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.LoginWindow', {
    extend: 'Ext.window.Window',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Login',
            layout: 'fit',
            width: 400,
            height: 200,
            closable: true,
            resizable: true,
            draggable: true,
            modal: true,
            border: true,
            items: [{
                xtype: 'loginform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
