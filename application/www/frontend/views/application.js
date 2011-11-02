/*
 * Application viewport class.
 */

Ext.define('Ext.ux.ApplicationViewport', {
    extend: 'Ext.Viewport',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var topRegion = {
            height: 100,
            border: false,
            tbar: [{
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
            },{
                text: 'Viewer',
                menu: [{
                    text: 'Reset',
                    listeners: {
                        click: function()
                        {
                            var viewer = Ext.getCmp('viewer');
                            
                            viewer.resetViewport();
                        }
                    }
                },{
                    text: 'Viewer settings...',
                    listeners: {
                        click: function()
                        {
                            Ext.ux.Viewer.showSettingsWindow();
                        }
                    }
                }]
            }, '->', {
                text: 'Options',
                menu: [{
                    text: 'Edit profile...',
                    listeners: {
                        click: function()
                        {
                            Authentication.showEditProfileWindow();
                        }
                    }
                },{
                    text: 'Viewer settings...',
                    listeners: {
                        click: function()
                        {
                            Ext.ux.Viewer.showSettingsWindow();
                        }
                    }
                }]
            },{
                text: 'Help'
            }, '-', {
                text: 'Login',
                listeners: {
                    click: function()
                    {
                        Authentication.showLoginWindow();
                    }
                }
            }],
            html: '(This panel will contain some books to open)'
        };
        
        var bottomRegion = {
            xtype: 'tabpanel',
            flex: 1,
            activeTab: 0,
            plain: true
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
        
        this.eventDispatcher = new EventDispatcher();
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.menu = this.items.get(0); // NOTE: this is the panel, should be the toolbar..
        this.tabs = this.items.get(1);
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
            
            // Tab listeners.
            listeners: {
                activate: function(tab)
                    {
                        var index = _this.tabs.items.findIndex('id', tab.id);
                        _this.tabActivated(index);
                    },
                deactivate: function(tab)
                    {
                        var index = _this.tabs.items.findIndex('id', tab.id);
                        _this.tabDeactivated(index);
                    },
                close: function(tab)
                    {
                        var index = _this.tabs.items.findIndex('id', tab.id);
                        _this.tabClosed(index);
                    }
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
                
            case 'profile':
                break;
                
            case 'search':
                // Add a search tab.
                Ext.apply(tabConfig, {
                    title: 'Search',
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'searchpanel',
                        width: 800,
                        height: 400
                    },{
                        border: false,
                        plain: true,
                        flex: 1
                    }]
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
                    title: 'Profile of ' + data.join('-'),
                    xtype: 'viewprofilepanel'
                });
                
                break;
                
            case 'register':
                // Add a registration form.
                Ext.apply(tabConfig, {
                    title: 'Registration',
                    layout: 'hbox',
                    bodyPadding: 10,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'registrationform',
                        width: 800,
                        height: 400
                    },{
                        border: false,
                        plain: true,
                        flex: 1
                    }]
                });
                
                break;
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
    
    getTabInfo: function(index)
    {
        return this.tabs.items.get(index).tabInfo;
    },

    tabClosed: function(index)
    {
        this.eventDispatcher.trigger('change', this, index);
        this.eventDispatcher.trigger('close', this, index);
    },

    tabActivated: function(index)
    {
        this.eventDispatcher.trigger('change', this, index);
        this.eventDispatcher.trigger('activate', this, index);
    },

    tabDeactivated: function(index)
    {
        this.eventDispatcher.trigger('change', this, index);
        this.eventDispatcher.trigger('deactivate', this, index);
    },
});
