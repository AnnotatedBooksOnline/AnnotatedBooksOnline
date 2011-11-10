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
                fieldLabel: 'Username'
            },{
                name: 'password',
                fieldLabel: 'Password',
                inputType: 'password'
            }],
            
            submitButtonText: 'Login'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        var form = this.getForm();

        if (form.isValid())
        {
            var values = form.getValues();
            
            Authentication.getInstance().login(values.username, values.password, this,
                function()
                {
                    this.up('window').close();
                },
                function(code, message, trace)
                {
                    // Show and error.
                    Ext.Msg.show({
                        title: 'Login failed.',
                        msg: 'Combination of username and password could not be found.',
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                });
        }
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
