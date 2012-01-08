/*
 * Login window class.
 */

Ext.define('Ext.ux.LoginForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.loginform',

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
            buttons: [{
                xtype: 'button',
                text: 'Cancel',
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
                text: 'Login',
                width: 140,
                handler: function()
                {
                    _this.submit();
                }
            }]
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
                    // Authentication will close this window.
                },
                function(code, message, trace)
                {
                    switch (code)
                    {
                        case 'user-not-found':
                        case 'user-banned':
                        case 'user-pending':
                            break;
                            
                        default:
                            return true;
                    }
                    
                    // Show an error.
                    Ext.Msg.show({
                        title: 'Login failed.',
                        msg: escape(message),
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                    
                    return false;
                });
        }
    }
});

Ext.define('Ext.ux.LoginWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Login',
            layout: 'fit',
            width: 400,
            height: 200,
            items: [{
                xtype: 'loginform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
