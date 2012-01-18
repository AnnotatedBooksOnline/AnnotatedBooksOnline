/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Welcome', {
    extend: 'Ext.Panel',
    alias: 'widget.welcomepanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var buttonWidth = 100;
        
        var loginButton = {
            xtype: 'button',
            name: 'login',
            text: 'Login',
            scale: 'large',
            iconCls: 'login-icon',
            width: buttonWidth,
            handler: function()
            {
                Authentication.showLoginWindow();
            }
        };
        
        var logoutButton = {
            xtype: 'button',
            name: 'logout',
            text: 'Logout',
            scale: 'large',
            iconCls: 'logout-icon',
            hidden: true,
            width: buttonWidth,
            handler: function()
            {
                Authentication.getInstance().logout();
            }
        };
        
        var registerButton = {
            xtype: 'button',
            name: 'register',
            text: 'Register',
            scale: 'large',
            iconCls: 'register-icon',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().gotoTab('register', [], true);
            }
        };
        
        var searchButton = {
            xtype: 'button',
            name: 'search',
            text: 'Search',
            scale: 'large',
            iconCls: 'search-icon',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().openTab('search', [], true);
            }
        };
        
        var uploadButton = {
            xtype: 'button',
            name: 'upload',
            text: 'Upload',
            scale: 'large',
            iconCls: 'upload-icon',
            hidden: true,
            width: buttonWidth,
            handler: function()
            {
                RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this, 
                    function(result)
                    {
                        if (result['status'] === 0)
                        {
                            Application.getInstance().gotoTab('reorderscan', [], true);
                        }
                        else if (result['status'] === 1)
                        {
                            Application.getInstance().gotoTab('selectbook', [], true);
                        }
                        else
                        {
                            Application.getInstance().gotoTab('uploadinfo', [], true);
                        }
                    }, 
                    function()
                    {
                        Ext.Msg.show({
                            title: 'Error',
                            msg: 'There is a problem with the server. Please try again later',
                            buttons: Ext.Msg.OK
                        });
                    }
                );
            }
        };
        
        var infoButton = {
            xtype: 'button',
            name: 'info',
            text: 'Info',
            scale: 'large',
            iconCls: 'info-icon',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().gotoTab('info', [], true);
            }
        };
        
        var defConfig = {
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                width: 500,
                style: 'margin-bottom: 20px;',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                defaults: {
                    style: 'margin-right: 5px;'
                },
                items: [
                    loginButton, registerButton, logoutButton,
                    searchButton, uploadButton, infoButton
                ]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
        
        this.callParent();
        
        RequestManager.getInstance().request('Main', 'textPage', {textPage: 'welcome-page'}, this,
            function(textPage)
            {
                var text = {
                    xtype: 'container',
                    items: {
                        xtype: 'panel',
                        border: false,
                        flex: 1,
                        width: 500,
                        cls: 'plaintext',
                        html: textPage
                    }
                };
                
                this.insert(this.items.length, [text]);
            }
        );
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            //this.down('[name=users]').show();
            //this.down('[name=upload]').show();
            this.down('[name=logout]').show();
            this.down('[name=login]').hide();
            this.down('[name=register]').hide();
        }
        else
        {
            //this.down('[name=users]').hide();
            //this.down('[name=upload]').hide();
            this.down('[name=logout]').hide();
            this.down('[name=login]').show();
            this.down('[name=register]').show();
        }
    }
});
