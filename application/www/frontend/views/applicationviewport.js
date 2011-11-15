/*
 * Application viewport class.
 */

Ext.define('Ext.ux.ApplicationViewport', {
    extend: 'Ext.Viewport',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var topRegion = {
            xtype: 'panel',
            border: false,
            height: 120,
            cls: 'header',
            html: '<h1>Collaboratory</h1>',
            
            bbar: [/*{
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
                listeners: {
                    click: function()
                    {
                        Application.getInstance().openTab('search', [], true);
                    }
                },
                name: 'search'
            },{
                text: 'Users',
                listeners: {
                    click: function()
                    {
                        Application.getInstance().gotoTab('users', [], true);
                    }
                },
                name: 'users',
                hidden: true
            },{
                text: 'Upload',
                listeners: {
                    click: function()
                    {
                        Application.getInstance().gotoTab('upload', [], true);
                    }
                },
                name: 'upload',
                hidden: true
            },{
                text: 'Info',
                listeners: {
                    click: function()
                    {
                        Application.getInstance().gotoTab('info', [], true);
                    }
                },
                name: 'info'
            }, '->', {
                text: '',
                menu: [{
                    text: 'Logout...',
                    iconCls: 'logout-icon',
                    listeners: {
                        click: function()
                        {
                            Authentication.getInstance().logout();
                        }
                    }
                },{
                    text: 'Edit profile...',
                    iconCls: 'user-icon',
                    listeners: {
                        click: function()
                        {
                            Authentication.showEditProfileWindow();
                        }
                    }
                }],
                name: 'logout',
                hidden: true
            }, {
                text: 'Login',
                listeners: {
                    click: function()
                    {
                        Authentication.showLoginWindow();
                    }
                },
                name: 'login'
            }, {
                text: 'Register',
                listeners: {
                    click: function()
                    {
                        Application.getInstance().gotoTab('register', [], true);
                    }
                },
                name: 'register'
            }, '-', {
                text: 'Options',
                menu: [{
                    text: 'Viewer settings...',
                    iconCls: 'settings-icon',
                    listeners: {
                        click: function()
                        {
                            Ext.ux.Viewer.showSettingsWindow();
                        }
                    }
                }/*,{
                    text: 'Help...'
                }*/]
            }],
            border: false
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
            case 'book':
                // Data is supposed to be a book id here.
                var id = data[0];
                if (!id)
                {
                    return;
                }
                
                // Add a book tab.
                Ext.apply(tabConfig, {
                    title: 'Book ' + id,
                    xtype: 'viewerpanel',
                    book: new Book(id) // NOTE: This will be asynchronious...
                });
                
                break;
                
            case 'search':
                // Add a search tab.
                Ext.apply(tabConfig, {
                    title: 'Search',
                    xtype: 'searchpanel'
                });
                
                break;
                
            case 'users':
                // Add a users tab.
                Ext.apply(tabConfig, {
                    title: 'Users',
                    xtype: 'userlistpanel',
                    border: false
                });
                
                break;
                
            case 'viewprofile':
                // Add a view profile tab.
                Ext.apply(tabConfig, {
                    title: 'Profile of ' + data[0],
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
                        height: 400
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
                    title: 'Upload',
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'uploadform',
                        border: false,
                        width: 800,
                        height: 600,
                        autoScroll: true,
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
            this.down("[name='users']").show();
            this.down("[name='upload']").show();
            this.down("[name='logout']").show();
            this.down("[name='login']").hide();
            this.down("[name='register']").hide();
        }
        else
        {
            this.down("[name='users']").hide();
            this.down("[name='upload']").hide();
            this.down("[name='logout']").hide();
            this.down("[name='login']").show();
            this.down("[name='register']").show();
        }
    },
    
    onAuthenticationModelChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.down("[name=logout]").setText('Logged on as <b>' + escape(authentication.getFullName()) + '</b>');
        }
    }
});
