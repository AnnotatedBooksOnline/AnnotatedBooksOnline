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
        var _this = this;

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
                	function resendActivationDialog(button)
                	{
                		if(button == 'yes')
                		{
                			RequestManager.getInstance().request(
                		            'UserActivation',
                		            'resendActivationMail',
                		            {username: values.username},
                		            _this,
                		            function(data)
                		            {
                		            	Ext.MessageBox.alert('Mail send', 'A new activation' +
                		            			             ' e-mail has been send', function(){});
                		            },
                		            function(data)
                		            {
                		            	return true;
                		            }
                		    );
                		}
                	}
                	
                	switch (code)
                    {
                        case 'user-not-found':
                        case 'user-banned':
                        case 'user-pending':
                        	break;
                        	
                        case 'user-should-activate':
                        	Ext.MessageBox.confirm('Not yet activated', 
                                    'You still need to activate your account through an activation' +
                                    ' e-mail. Would you like a new activation mail to be send to you?',
                                    resendActivationDialog);
                            return false;
                            
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
