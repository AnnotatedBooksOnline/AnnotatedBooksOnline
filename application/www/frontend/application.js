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

/*
 * Private methods.
 */

Application.prototype.initialize = function()
{
    // Initialize history and quicktips.
    Ext.History.init();
    Ext.tip.QuickTipManager.init();
    
    // Create application viewport.
    this.viewport = new Ext.ux.ApplicationViewport();
    
    // Listen for tab changes
    this.viewport.getEventDispatcher().bind('activate', function(event, viewport, index)
        {
            var info = viewport.getTabInfo(index);
            
            this.addHistoryAction(info.type, info.data);
        }, this);
    
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
    
    // DEBUG: Open some books.
    this.viewport.openTab('book', [10]);
    this.viewport.openTab('book', [5]);
    this.viewport.openTab('search');
    this.viewport.openTab('users');
    this.viewport.openTab('register');
    this.viewport.openTab('viewprofile', ['Renze']);
    
    // Get authentication and request manager instances.
    this.authentication = Authentication.getInstance();
    this.requestManager = RequestManager.getInstance();
}

Application.prototype.registerActions = function()
{
    // Listen for history actions.
    this.eventDispatcher.bind('historychange', function(event, app, action, data)
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
                    // These are tab actions, so close the windows.
                    Ext.WindowManager.each(
                        function(window)
                        {
                            if (window instanceof Ext.window.Window)
                                window.close();
                        }
                    );
                    
                    // Go to the given panel.
                    this.viewport.gotoTab(action, data, true);
                    break;
            }
        }, this);
}

// Start application.
Ext.require(['*']);
Ext.onReady(function()
    {
        // Fetch an application instance to show it.
        Application.getInstance();
    });
