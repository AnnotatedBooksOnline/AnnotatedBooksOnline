/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Application class.
 */

// Class definition.
function Application()
{
    //if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Application.prototype.viewport;

Application.prototype.eventDispatcher;

Application.prototype.currentToken;

// Singleton instance.
Application.instance;

// Constructor.
Application.prototype.constructor = function()
{
    this.eventDispatcher = new EventDispatcher();
}

/*
 * Public methods.
 */

Application.getInstance = function()
{
    if (Application.instance === undefined)
    {
        Application.instance = new Application();
    
        // Initialize here, so that methods that need an instance of the singleton
        // will get it without recursively initializing.
        Application.instance.initialize();
    }
    
    return Application.instance;
}

// Gets event dispatcher.
Viewport.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

Application.prototype.addHistoryAction = function(action, data)
{
    // If it is a new token, add it.
    var currentToken = Ext.History.getToken();
    var newToken     = action + ((data && data.length) ? '-' + data.join('-') : '');
    if ((currentToken !== newToken) && (this.currentToken !== newToken))
    {
        // Add token to history.
        Ext.History.add(newToken);
    }
    
    // Set current token.
    this.currentToken = newToken;
}

Application.prototype.openTab = function(type, data, activateTab)
{
    // Check if allowed type.
    if (!this.authentication.isLoggedOn() && this.tabNeedsAuthentication(type))
    {
        this.authentication.requireLogin(this, function()
            {
                // Redirect call.
                this.viewport.openTab(type, data, activateTab);
            });
        
        return;
    }
    
    // Redirect call.
    this.viewport.openTab(type, data, activateTab);
}

Application.prototype.gotoTab = function(type, data, openIfNotAvailable)
{
    // Check if allowed type.
    if (!this.authentication.isLoggedOn() && this.tabNeedsAuthentication(type))
    {
        this.authentication.requireLogin(this, function()
            {
                // Redirect call.
                this.viewport.openTab(type, data, openIfNotAvailable);
            });
        
        return;
    }
    
    // Redirect call.
    this.viewport.gotoTab(type, data, openIfNotAvailable);
}

/*
 * Private methods.
 */

Application.prototype.initialize = function()
{
    // Get authentication and request manager instances.
    this.requestManager = RequestManager.getInstance();
    this.authentication = Authentication.getInstance();
    
    // Initialize history and quicktips.
    Ext.History.init();
    Ext.tip.QuickTipManager.init();
    
    // Create application viewport.
    this.viewport = new Ext.ux.ApplicationViewport();
    
    // Listen for tab changes
    this.viewport.getEventDispatcher().bind('activate', this, function(event, viewport, index)
        {
            var info = viewport.getTabInfo(index);
            
            this.addHistoryAction(info.type, info.data);
        });
    
    this.viewport.getEventDispatcher().bind('beforeclose', this, function(event, viewport, index)
        {
            //alert('close');
            
            //Ext.History.back();
            
            // TODO: go to previous tab, instead of first one.
        });
    
    // Register actions.
    this.registerActions();
    
    // Add history change event.
    var _this = this;
    var historyChangeEventHandler = function(token)
        {
            // Get action and data from token.
            var parts  = token.split('-');
            var action = parts[0];
            var data   = parts.splice(1) || [];
            
            // Set current token.
            _this.currentToken = token;
            
            // Trigger events.
            _this.eventDispatcher.trigger('historychange', _this, action, data);
            _this.eventDispatcher.trigger(action + 'action', _this, action, data);
        };
    Ext.History.on('change', historyChangeEventHandler);
    
    // Fetch initial token.
    if (window.location.hash)
    {
        // Get token from hash.
        var token = window.location.hash.substr(1);
        
        historyChangeEventHandler(token);
    }
    
    // Handle authentication changes.
    this.authentication.getEventDispatcher().bind('change', this, this.onAuthenticationChange);
}

Application.prototype.registerActions = function()
{
    // Listen for history actions.
    this.eventDispatcher.bind('historychange', this, function(event, app, action, data)
        {
            switch (action)
            {
                case 'login':
                    Authentication.showLoginWindow();
                    break
                    
                case 'editprofile':
                    Authentication.showEditProfileWindow();
                    break;
                    
                case 'viewersettings':
                    Ext.ux.Viewer.showSettingsWindow();
                    break;
                    
                case 'book':
                case 'search':
                case 'users':
                case 'viewprofile':
                case 'register':
                case 'upload':
                case 'welcome':
                case 'info':
                    // These are tab actions, so close the windows.
                    Ext.WindowManager.each(
                        function(window)
                        {
                            if (window instanceof Ext.window.Window)
                                window.close();
                        }
                    );
                    
                    // Go to the given panel.
                    this.gotoTab(action, data, true);
                    break;
            }
        });
}

Application.prototype.onAuthenticationChange = function(event, authentication)
{
    if (!authentication.isLoggedOn())
    {
        // Close all tabs that need authentication.
        var tabsInfo = this.viewport.getTabsInfo();
        for (var i = tabsInfo.length - 1; i >= 0; --i)
        {
            // Close tab if it needs authentication.
            if (this.tabNeedsAuthentication(tabsInfo[i].type))
            {
                this.viewport.closeTab(i);
            }
        }
    }
}

Application.prototype.tabNeedsAuthentication = function(type)
{
    // Specify a whitelist here.
    switch (type)
    {
        case 'book':
        case 'search':
        case 'register':
        case 'welcome':
        case 'info':
            return false;
    }
    
    return true;
}

// Start application.
Ext.require(['*']);
Ext.onReady(function()
    {
        // Fetch an application instance to show it.
        Application.getInstance();
    });
