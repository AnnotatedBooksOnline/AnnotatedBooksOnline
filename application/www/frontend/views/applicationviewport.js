/*
 * Application viewport class.
 */

Ext.define('Ext.ux.ApplicationViewport', {
    extend: 'Ext.Viewport',
    
    initComponent: function() 
    {
        var _this = this;
    	
    	var userItems = [{
            colspan: 2,
            border: false,
            html: 'Welcome, <b>Guest</b>',
            cls: 'user-text',
            name: 'welcometext',
            width: 300,
            setName: function(name)
            {
                this.body.update('Welcome, <b>' + escape(name) + '</b>');
            }
        },{
            xtype: 'container',
            width: 180,
            rowspan: 5
        },{
            xtype: 'button',
            text: 'Login',
            width: 120,
            height: 25,
            iconCls: 'login-icon',
            listeners: {
                click: function()
                {
                    Authentication.showLoginWindow();
                }
            },
            name: 'login',
            cls: 'user-button'
        },{
            xtype: 'button',
            text: 'Forgot password?',
            iconCls: 'passwordforgotten-icon',
            width: 120,
            height: 25,
            listeners: {
                click: function()
                {
                    function handlePasswordForgotten(button, email)
                    {
                    	if(button == 'ok')
                    	{
                    		RequestManager.getInstance().request(
                    	            'User',
                    	            'passwordForgotten',
                    	            {
                    	            	email: email
                    	            },
                    	            _this,
                    	            function(data)
                    	            {
                    	            	Ext.MessageBox.alert('Success', 'An e-mail with' +
                    	            			' instructions on how to reset your password will' +
                    	            			' be send to you in a few minutes.');
                    	            },
                    	            function(data)
                    	            {
                    	            	Ext.MessageBox.alert('Error', 'An error occurred while' + 
                                          'trying to send the restoration e-mail. Please try again' +
                                          ' later. If the problem persists: please contact the' + 
                                          ' webmaster.');
                    	            }
                    	    );
                    	}
                    }
                	
                	Ext.MessageBox.prompt('Password forgotten.', 'Please enter your e-mail address' + 
                                            ' to which a password restoration mail can be send:', 
                                            handlePasswordForgotten);
                }
            },
            name: 'password',
            xtype: 'button',
            cls: 'user-button'
        },{
            xtype: 'button',
            text: 'Register',
            width: 120,
            height: 25,
            iconCls: 'register-icon',
            listeners: {
                click: function()
                {
                    Application.getInstance().gotoTab('register', [], true);
                }
            },
            name: 'register',
            cls: 'user-button'
        },{
            xtype: 'button',
            text: 'Logout',
            width: 120,
            height: 25,
            iconCls: 'logout-icon',
            listeners: {
                click: function()
                {
                    Authentication.getInstance().logout();
                }
            },
            name: 'logout',
            hidden: true,
            cls: 'user-button'
        },{
            xtype: 'button',
            text: 'Edit profile',
            width: 120,
            height: 25,
            iconCls: 'user-icon',
            listeners: {
                click: function()
                {
                    Authentication.showEditProfileWindow();
                }
            },
            name: 'profile',
            xtype: 'button',
            cls: 'user-button',
            hidden: true
        }];
        
        var menuButtons = [/*{
            text: 'Book',
            menu: [{
                text: 'Save current page...'
            },{
                text: 'Go to page...'
            },{
                text: 'Print...'
            },{
                text: 'Close'
            }]
        },*/{
            text: 'Search',
            iconCls: 'search-icon',
            listeners: {
                click: function()
                {
                    Application.getInstance().openTab('search', [], true);
                }
            },
            name: 'search'
        },{
           
            text: 'Upload',
            iconCls: 'upload-icon',
            listeners: {
                click: function()
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
                    });
                }
            },
            name: 'upload',
            hidden: true
        },{
            xtype: 'tbseparator',
            cls: 'menu-separator'
        },{
            text: 'Info',
            iconCls: 'info-icon',
            listeners: {
                click: function()
                {
                    Application.getInstance().gotoTab('info', [], true);
                }
            },
            name: 'info'
        },{
            xtype: 'tbseparator',
            cls: 'menu-separator'
        },/*{
            text: 'Options',
            iconCls: 'settings-icon',
            menu: [{
                text: 'Viewer settings...',
                iconCls: 'settings-icon',
                listeners: {
                    click: function()
                    {
                        Ext.ux.Viewer.showSettingsWindow();
                    }
                }
            }]
        },*/{
            text: 'Users',
            iconCls: 'users-icon',
            listeners: {
                click: function()
                {
                    Application.getInstance().gotoTab('users', [], true);
                }
            },
            name: 'users',
            hidden: true
        }];
        
        var topRegion = {
            xtype: 'panel',
            border: false,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            height: 120,
            cls: 'header',
            items: [{ // Header logo.
                xtype: 'container',
                width: 120,
                cls: 'header-logo'
            },{ //Title, with menu below.
                xtype: 'container',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1,
                items: [{
                    xtype: 'container',
                    height: 87,
                    html: '<h1>Collaboratory</h1><div class="version">#COLLABVERSION#</div>'
                },{
                    xtype: 'container',
                    defaults: {
                        xtype: 'button',
                        cls: 'menu-button'
                    },
                    layout: 'hbox',
                    items: menuButtons
                }]
            },{ // User items.
                border: false,
                bodyPadding: 10,
                width: 320,
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: userItems
            }]
        };
        
        var bottomRegion = {
            xtype: 'tabpanel',
            flex: 1
        };
        
        var _this = this;
        var defConfig = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [topRegion, bottomRegion]
        };
        
        Ext.apply(this, defConfig);
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
        eventDispatcher.bind('modelchange', this, this.onAuthenticationModelChange);
        
        this.eventDispatcher = new EventDispatcher();
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.menu = this.items.get(0); // NOTE: this is the panel, should be the toolbar..
        this.tabs = this.items.get(1);
        
        this.openTab('welcome', [], true);
    },
    
    getEventDispatcher: function()
    {
        return this.eventDispatcher;
    },
    
    openTab: function(type, data, activateTab)
    {
        var _this = this;
        var tabConfig = {
            // Our tab info.
            tabInfo: {type: type, data: data},
            
            // Default settings.
            closable: true,
            
            // Enable scrolling.
            autoScroll: true,
            
            // Tab listeners.
            listeners: {
                activate:    function(tab) { _this.onTabEvent(tab, 'activate');    },
                deactivate:  function(tab) { _this.onTabEvent(tab, 'deactivate');  },
                beforeclose: function(tab) { _this.onTabEvent(tab, 'beforeclose'); },
                close:       function(tab) { _this.onTabEvent(tab, 'close');       }
            }
        };
        
        switch (type)
        {
            case 'binding':
                // Data is supposed to be a binding id here.
                var bindingId = data[0];
                if (!bindingId)
                {
                    return;
                }
                
                // If given, go to the right page immediately.
                var pageNumber = 0;
                if (data.length > 1)
                {
                    pageNumber = parseInt(data[1] - 1);
                }
                
                // Fetch binding.
                Binding.createFromId(bindingId, this,
                    function(binding)
                    {
                        // Add a viewer tab.
                        Ext.apply(tabConfig, {
                            xtype: 'viewerpanel',
                            title: 'Binding ' + escape(binding.getModel().get('signature')), // TODO: Move to viewerpanel.
                            binding: binding,
                            pageNumber: pageNumber
                        });
                        
                        // Add tab.
                        var newTab = this.tabs.add(tabConfig);
                        
                        // Activate tab.
                        if (activateTab !== false)
                        {
                            this.tabs.setActiveTab(newTab);
                        }
                    },
                    function()
                    {
                        // TODO: Show an error.
                    });
                
                return;
                
            case 'reorderscan':
                // Add a view profile tab.
                Ext.apply(tabConfig, {
                    title: 'Upload (reorder scans)',
                    xtype: 'reorderscanform',
                    selectFirst: false
                });
                
                break;
                
            case 'search':
                // Add a search tab.
                Ext.apply(tabConfig, {
                    title: 'Search',
                    xtype: 'searchpanel'
                });
                
                break;
                
            case 'selectbook':
                // Add a view profile tab.
                Ext.apply(tabConfig, {
                    title: 'Upload (select books)',
                    xtype: 'selectbookform',
                    selectFirst: false
                });
                
                break;
                
            case 'users':
                // Add a users tab.
                Ext.apply(tabConfig, {
                    title: 'Users',
                    xtype: 'userlistpanel'
                });
                
                break;
                
            case 'viewprofile':
                // TODO: data[0] may not even exist!
                // TODO: Fetch user here.
                // TODO: Handle non-existing users here.
                
                // Add a view profile tab.
                Ext.apply(tabConfig, {
                    title: 'Profile of ' + escape(data[0]),
                    xtype: 'viewprofilepanel'
                });
                
                break;
                
            case 'register':
                // Add a registration panel.
                Ext.apply(tabConfig, {
                    title: 'Registration',
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'registrationpanel',
                        border: false,
                        width: 800,
                        height: 355
                    },{
                        border: false,
                        plain: true,
                        flex: 1
                    }]
                });
                
                break;
            
            case 'upload':
                // Add an upload panel.
                Ext.apply(tabConfig, {
                    title: 'Upload (upload)',
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'uploadform',
                        selectFirst: false,
                        border: false,
                        width: 800,
                        autoScroll: true
                    },{
                        border: false,
                        plain: true,
                        flex: 1
                    }]
                });
                
                break;
            
            case 'welcome':
                // Add a welcome tab.
                Ext.apply(tabConfig, {
                    title: 'Welcome',
                    xtype: 'welcomepanel',
                    closable: false
                });
                
                break;
            
            case 'info':
                // Add an info tab.
                Ext.apply(tabConfig, {
                    title: 'Info',
                    xtype: 'infopanel'
                });
                
                break;
                
            case 'activation':
                // Add an activation tab.
                Ext.apply(tabConfig, {
                    title: 'Activation',
                    xtype: 'activationpanel'
                });
                
                break;
                
            case 'restorepass':
                // Add a password restore tab.
                Ext.apply(tabConfig, {
                    title: 'Restore password',
                    xtype: 'restorepasswordpanel'
                });
                
                break;
            
                
            case 'uploadinfo':
                // Add an upload instructions tab.
                Ext.apply(tabConfig, {
                    title: 'Upload (instructions)',
                    xtype: 'uploadinstructionpanel'
                });
                
                break;
            
            default:
                throw new Error('Unknown tab type: \'' + type + '\'.');
        }
        
        // Add tab.
        var newTab = this.tabs.add(tabConfig);
        
        // Activate tab.
        if (activateTab !== false)
        {
            this.tabs.setActiveTab(newTab);
        }
    },
    
    gotoTab: function(type, data, openIfNotAvailable)
    {
        // Try to match the type and data
        var joinedData = (data === undefined) ? '' : data.join('-');
        var index = this.tabs.items.findIndexBy(function(obj, key)
            {
                var tabJoinedData = (obj.tabInfo.data === undefined) ? '' :
                    obj.tabInfo.data.join('-');
                
                return (obj.tabInfo.type == type) && (joinedData === tabJoinedData);
            });
        
        // Go to that tab.
        if (index >= 0)
        {
            this.tabs.setActiveTab(index);
        }
        else if (openIfNotAvailable === true)
        {
            this.openTab(type, data);
        }
    },
    
    closeTab: function(index)
    {
        this.tabs.items.get(index).close();
    },
    
    getTabInfo: function(index)
    {
        return this.tabs.items.get(index).tabInfo;
    },
    
    getTabsInfo: function()
    {
        var result = [];
        this.tabs.items.each(
            function(tab, index)
            {
                result[index] = tab.tabInfo;
            });
        
        return result;
    },
    
    onTabEvent: function(tab, event)
    {
        var index = this.tabs.items.findIndex('id', tab.id);
        
        this.eventDispatcher.trigger('change', this, index);
        this.eventDispatcher.trigger(event, this, index);
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.down('[name=users]').show();
            this.down('[name=upload]').show();
            this.down('[name=logout]').show();
            this.down('[name=profile]').show();
            this.down('[name=login]').hide();
            this.down('[name=register]').hide();
            this.down('[name=password]').hide();
        }
        else
        {
            this.down('[name=users]').hide();
            this.down('[name=upload]').hide();
            this.down('[name=logout]').hide();
            this.down('[name=profile]').hide();
            this.down('[name=login]').show();
            this.down('[name=register]').show();
            this.down('[name=password]').show();
        }
    },
    
    onAuthenticationModelChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.down('[name=welcometext]').setName(authentication.getFullName());
        }
        else
        {
            this.down('[name=welcometext]').setName('Guest');
        }
    }
});
