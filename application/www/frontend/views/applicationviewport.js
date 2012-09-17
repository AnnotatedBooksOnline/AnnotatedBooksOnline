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
            width: 200,
            setName: function(name)
            {
                this.body.update('Welcome, <b>' + escape(name) + '</b>');
            }
        },{
            xtype: 'container',
            width: 80,
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
                    // TODO: Move this, we can't know of any logic like this.
                    
                    function handlePasswordForgotten(button, email)
                    {
                        if (button == 'ok')
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
                                    Ext.MessageBox.alert('Success', 'An email with' +
                                        ' instructions on how to reset your password will' +
                                        ' be send to you in a few minutes.');
                                },
                                function(error)
                                {
                                    if (error == 'user-not-found')
                                    {
                                        Ext.MessageBox.alert('Email unkown', 'The specified' +
                                                ' email address is not present in the system.');
                                        
                                        return false;
                                    }
                                    else
                                    {
                                        return true;
                                    }
                                }
                            );
                        }
                    }
                    
                    Ext.MessageBox.prompt('Password forgotten.', 'Please enter your email address' + 
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
            iconCls: 'edit-profile-icon',
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
        
        var menuButtons = [{
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
                    // TODO: Move this, we can't know of any logic like this.
                    // TODO: You do know a user can just click the back button in the browser, right?
                    // TODO: Or go to the upload tab directly.
                    
                    RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this,
                        function(result)
                        {
                            if (result['status'] == 0)
                            {
                                Application.getInstance().gotoTabUnique('reorderscan', [result['bindingId']], true);
                            }
                            else if (result['status'] == 1)
                            {
                                Application.getInstance().gotoTabUnique('selectbook', [result['bindingId']], true);
                            }
                            else
                            {
                                Application.getInstance().gotoTabUnique('upload', [], true);
                            }
                        }
                    );
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
            name: 'info',
            // Depend visiblity of info button on setting.
            hidden: getCachedSetting('info-button') == "0"
        },{
            xtype: 'tbseparator',
            cls: 'menu-separator',
            hidden: getCachedSetting('info-button') == "0"
        },{
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
        },{
            text: 'Help',
            iconCls: 'help-icon',
            listeners: {
                click: function()
                {
                    var tabInfo = _this.getTabInfo();
                    
                    Application.getInstance().gotoTabUnique('help', [tabInfo.type], true);
                }
            },
            name: 'help'
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
            items: [{ 
                // Header logo.
                xtype: 'container',
                width: 256,
                cls: 'header-logo'
            },{ 
                // Title, with menu below.
                layout: 'border',
                border: false,
                flex: 1,
                items: [{
                    region: 'center',
                    border: false,
                    html: '<h1>' + escape(document.title)
                          + '</h1><div class="version">#COLLABVERSION#</div>'
                },{
                    height: 34,
                    bodyPadding: 2,
                    region: 'south',
                    border: false,
                    defaults: {
                        xtype: 'button',
                        cls: 'menu-button'
                    },
                    layout: 'hbox',
                    items: menuButtons
                },{ 
                    // User items.
                    border: false,
                    bodyPadding: 10,
                    width: 220,
                    region: 'east',
                    layout: {
                        type: 'table',
                        columns: 2
                    },
                    items: userItems
                }]
            }]
        };
        
        var bottomRegion = {
            xtype: 'tabpanel',
            flex: 1,
            cls: 'main-tabpanel'
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
        
        this.menu = this.items.get(0);
        this.tabs = this.items.get(1);
        
        this.correctVmlSupport();
        
        if (Authentication.getInstance().isLoggedOn())
        {
            this.updateUploadButtonTitle();
        }
        
        // Determine whether to start with the welcome tab or the search tab. 
        var firstTab;
        if(getCachedSetting('show-welcome-page') == '1')
        {
            firstTab = 'welcome';
        }
        else
        {
            firstTab = 'search';
        }
        
        this.openTab(firstTab, [], true);
    },
    
    correctVmlSupport: function()
    {
        if (!Ext.supports.Vml)
        {
            try
            {
                Ext.supports.Vml = (function()
                {
                    var a = document.createElement('div');
                    a = document.body.appendChild(a) || a;
                    a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
                    var b = a.firstChild;
                    b.style.behavior = "url(#default#VML)";
                    var vmlSupported = b ? typeof b.adj == "object": true;
                    a.parentNode.removeChild(a);
                    return vmlSupported;
                })();
            }
            catch(e) {}
        }
    },
    
    getEventDispatcher: function()
    {
        return this.eventDispatcher;
    },
    
    openTab: function(type, data, activateTab)
    {
        // Start loading.
        this.down('tabpanel').setLoading(true);
        
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
                    // Loading is finished.
                    this.down('tabpanel').setLoading(false);
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
                        var correctStatus = binding.getScanAmount() > 0;
                        
                        // Check for correct binding status.
                        if (binding.getModel().get('status') !== 2)
                        {
                            correctStatus = false;
                        }
                        
                        // Check for correct scan status.
                        for (var i = binding.getScanAmount() - 1; i >= 0; --i)
                        {
                            if (binding.getScan(i).get('status') !== 5)
                            {
                                correctStatus = false;
                                break;
                            }
                        }
                        
                        if (correctStatus)
                        {
                            // Add a viewer tab.
                            Ext.apply(tabConfig, {
                                xtype: 'viewerpanel',
                                binding: binding,
                                pageNumber: pageNumber,
                                iconCls: 'viewer-icon'
                            });
                            
                            // Add tab.
                            var newTab = this.tabs.add(tabConfig);
                            
                            // Activate tab.
                            if (activateTab !== false)
                            {
                                this.tabs.setActiveTab(newTab);
                            }
                        }
                        else
                        {
                            Ext.Msg.show({
                                title:'Error',
                                msg: 'The ' +
                                    (data.length == 1 ? 'binding' : 'book') +
                                    ' you are trying to view is not (yet) available.',
                                icon: Ext.Msg.ERROR,
                                buttons: Ext.Msg.OK
                            });
                        }
                        
                        // Loading is finished.
                        this.down('tabpanel').setLoading(false);
                    },
                    function()
                    {
                        // Loading is finished.
                        this.down('tabpanel').setLoading(false);
                    });
                
                return;
                
            case 'reorderscan':
                var isExistingBinding = false;
                if (data.length >= 2 && data[1] !== undefined) 
                {
                    isExistingBinding = data[1];
                }
                // Add a reorder scan tab.
                Ext.apply(tabConfig, {
                    title: isExistingBinding === true ? 'Modify binding (reorder scans)' : 'Upload (reorder scans)',
                    xtype: 'reorderscanform',
                    bindingId: data[0],
                    isExistingBinding: isExistingBinding,
                    iconCls: isExistingBinding === true ? 'binding-edit-icon' : 'upload-icon'
                });
                
                break;
                
            case 'help':
                // Add a help tab.
                Ext.apply(tabConfig, {
                    title: 'Help',
                    xtype: 'helppanel',
                    iconCls: 'help-icon',
                    helpType: data[0]
                });
                
                break;
                
            case 'search':
                // Add a search tab.
                Ext.apply(tabConfig, {
                    title: 'Search',
                    xtype: 'searchpanel',
                    iconCls: 'search-icon'
                });
                
                break;
                
            case 'selectbook':
                var isExistingBinding = false;
                if (data.length >= 2 && data[1] !== undefined)
                {
                    isExistingBinding = data[1];
                }
                
                // Add a select book tab.
                Ext.apply(tabConfig, {
                    title: isExistingBinding === true ? 'Modify binding (select books)' : 'Upload (select books)',
                    xtype: 'selectbookform',
                    bindingId: data[0],
                    isExistingBinding: isExistingBinding,
                    iconCls: isExistingBinding === true ? 'binding-edit-icon' : 'upload-icon'
                });
                
                break;
                
            case 'users':
                // Add a users tab.
                Ext.apply(tabConfig, {
                    title: 'Users',
                    xtype: 'userlistpanel',
                    iconCls: 'users-icon'
                });
                
                break;
                
            case 'viewprofile':
                var username = data[0];
                if (!username)
                {
                    // Loading is finished.
                    this.down('tabpanel').setLoading(false);
                    return;
                }
                
                // Check if this username exists.
                RequestManager.getInstance().request('User', 'usernameExists', {username: username}, this, 
                    function(exists)
                    {
                        if (exists)
                        {
                            Ext.apply(tabConfig, {
                                title: 'Profile of ' + escape(data[0]),
                                xtype: 'viewprofilepanel',
                                iconCls: 'profile-icon'
                            });
                            
                            // Add tab.
                            var newTab = _this.tabs.add(tabConfig);
                            
                            // Activate tab.
                            if (activateTab !== false)
                            {
                                _this.tabs.setActiveTab(newTab);
                            }
                        }
                        else
                        {
                            Ext.Msg.show({
                                title:'Error',
                                msg: 'The requested user \'' + escape(username) + '\' does not exist.',
                                icon: Ext.Msg.ERROR,
                                buttons: Ext.Msg.OK
                            });
                        }
                        
                        // Loading is finished.
                        this.down('tabpanel').setLoading(false);
                    },
                    function()
                    {
                        // Loading is finished.
                        this.down('tabpanel').setLoading(false);
                    }
                );
                
                return;
                
            case 'register':
                // Add a registration panel.
                Ext.apply(tabConfig, {
                    title: 'Registration',
                    layout: 'hbox',
                    iconCls: 'register-icon',
                    bodyPadding: 10,
                    cls: 'white-tab',
                    frame: true,
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
                // Identify a possible existing binding passed to the upload panel.           
                var existingBindingId = undefined;
                if (data.length > 0 && data[0] !== undefined) 
                {
                    existingBindingId = data[0];
                }
                
                // Add an upload panel.
                Ext.apply(tabConfig, {
                    title: existingBindingId == undefined ? 'Upload (upload)' : 'Modify binding',
                    name: 'upload',
                    layout: 'hbox',
                    iconCls: existingBindingId == undefined ? 'upload-icon' : 'binding-edit-icon',
                    bodyPadding: 10,
                    cls: 'white-tab',
                    frame: true,
                    items: [{
                        border: false,
                        plain: true,
                        flex: 1
                    },{
                        xtype: 'uploadform',
                        selectFirst: false,
                        existingBindingId: existingBindingId,
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
                    closable: false,
                    iconCls: 'welcome-icon'
                });
                
                break;
            
            case 'info':
                // Add an info tab.
                Ext.apply(tabConfig, {
                    title: 'Info',
                    xtype: 'infopanel',
                    iconCls: 'info-icon'
                });
                
                break;
            
            case 'termsofuse':
                // Add a terms of use tab.
                Ext.apply(tabConfig, {
                    title: 'Terms of Use',
                    xtype: 'termsofusepanel',
                    iconCls: 'termsofuse-icon'
                });
                
                break;
                
            case 'activation':
                // Add an activation tab.
                Ext.apply(tabConfig, {
                    title: 'Activation',
                    xtype: 'activationpanel',
                    iconCls: 'activation-icon'
                });
                
                break;
                
            case 'restorepass':
                // Add a password restore tab.
                Ext.apply(tabConfig, {
                    title: 'Restore password',
                    xtype: 'restorepasswordpanel',
                    iconCls: 'passwordforgotten-icon'
                });
                
                break;
            
                
            case 'uploadinfo':
                // Add an upload instructions tab.
                Ext.apply(tabConfig, {
                    title: 'Upload (instructions)',
                    xtype: 'uploadinstructionpanel',
                    iconCls: 'upload-icon'
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
        
        // Loading is finished.
        this.down('tabpanel').setLoading(false);
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
    
    gotoTabUnique: function(type, data, openIfNotAvailable)
    {
        // Try to match the type
        var index = this.tabs.items.findIndexBy(function(obj, key)
            {
                return (obj.tabInfo.type == type);
            });
        
        // Go to that tab.
        if (index >= 0)
        {
            this.tabs.setActiveTab(index);
            
            //update the tab if the tab has an updateTab function
            var theTab = this.tabs.getActiveTab();
            if (theTab.updateTab !== undefined)
            {
                theTab.updateTab(data, theTab);
            }
        }
        else if (openIfNotAvailable === true)
        {
            this.openTab(type, data);
        }
    },
    
    closeTab: function(index)
    {
        if (index === undefined)
        {
            return this.tabs.getActiveTab().close();
        }
        
        this.tabs.items.get(index).close();
    },
    
    getTabInfo: function(index)
    {
        if (index === undefined)
        {
            return this.tabs.getActiveTab().tabInfo;
        }
        
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
    
    // TODO: Remove this, how it this a task of the application viewport?
    // TODO: It should not even know of any tab content.
    updateUploadButtonTitle: function() {
        var _this = this;
        
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this,
            function(result)
            {
                if (result['status'] === 0 || result['status'] === 1)
                {
                    _this.down('[name=upload]').setText('Complete binding');
                }
                else
                {
                    _this.down('[name=upload]').setText('Upload');
                }
            }
        );
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.down('[name=logout]').show();
            this.down('[name=profile]').show();
            this.down('[name=login]').hide();
            this.down('[name=register]').hide();
            this.down('[name=password]').hide();
            
            this.updateUploadButtonTitle();
        }
        else
        {
            this.down('[name=logout]').hide();
            this.down('[name=profile]').hide();
            this.down('[name=login]').show();
            this.down('[name=register]').show();
            this.down('[name=password]').show();
        }
    },
    
    onAuthenticationModelChange: function(event, authentication)
    {
        // Set user his name.
        if (authentication.isLoggedOn())
        {
            this.down('[name=welcometext]').setName(authentication.getFullName());
        }
        else
        {
            this.down('[name=welcometext]').setName('Guest');
        }
        
        // Display upload and users buttons when when user has permission.
        if (Authentication.getInstance().hasPermissionTo('view-users-part'))
        {
            this.down('[name=users]').show();
        }
        else
        {
            this.down('[name=users]').hide();
        }
        
        if (Authentication.getInstance().hasPermissionTo('upload-bindings'))
        {
            this.down('[name=upload]').show();
        }
        else
        {
            this.down('[name=upload]').hide();
        }
    }
});

