/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Authentication class.
 */

// Class definition.
function Authentication()
{
    //if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Authentication.prototype.eventDispatcher;
Authentication.prototype.loggedOn;

Authentication.prototype.keepAliveInterval;

// Singleton instance.
Authentication.instance;

// Constructor.
Authentication.prototype.constructor = function()
{
    this.eventDispatcher = new EventDispatcher();
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Authentication.getInstance = function()
{
    if (Authentication.instance === undefined)
    {
        Authentication.instance = new Authentication();
    }
    
    return Authentication.instance;
}

// Gets event dispatcher.
Viewport.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

Authentication.prototype.isLoggedOn = function()
{
    return this.loggedOn;
}

Authentication.showLoginWindow = function()
{
    // Check if the login window is not already shown.
    if (Authentication.loginWindow !== undefined)
    {
        Ext.WindowManager.bringToFront(Authentication.loginWindow);
        
        return;
    }
    
    // Register action.
    Application.getInstance().addHistoryAction('login');
    
    // Show login window.
    var _this = this;
    Authentication.loginWindow = new Ext.ux.LoginWindow({
            listeners: {
                close: function() { Authentication.loginWindow = undefined; }
            }
        });
    Authentication.loginWindow.show();
}

Authentication.showEditProfileWindow = function()
{
    // Check if the profile window is not already shown.
    if (Authentication.profileWindow !== undefined)
    {
        Ext.WindowManager.bringToFront(Authentication.profileWindow);
        
        return;
    }
    
    // Register action.
    Application.getInstance().addHistoryAction('editprofile');
    
    // Show profile window.
    var _this = this;
    Authentication.profileWindow = new Ext.ux.EditProfileWindow({
            listeners: {
                close: function() { Authentication.profileWindow = undefined; }
            }
        });
    Authentication.profileWindow.show();
}

Authentication.prototype.logout = function()
{
    // TODO: Send logout request.
    
    this.loggedOn = false;
    
    // Clear keep-alive interval
    if (this.keepAliveInterval !== undefined)
    {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = undefined;
    }
    
    // Trigger logout.
    this.eventDispatcher.trigger('change', this);
    this.eventDispatcher.trigger('logout', this);
}

Authentication.prototype.login = function(username, password, onSuccess, onError, obj)
{
    // Do a login request.
    RequestManager.getInstance().request('Authentication', 'login', {username: username, password: password},
        this,
        function(data)
        {
            // We are logged on.
            this.loggedOn = true;
            
            // Create keep-alive interval.
            var _this = this;
            this.keepAliveInterval = setInterval(function() { _this.keepAlive(); }, 10000);
            
            // Trigger login.
            this.eventDispatcher.trigger('change', this);
            this.eventDispatcher.trigger('login', this);
            
            // Call success handler
            if (onSuccess !== undefined)
            {
                onSuccess.call(obj);
            }
        }, onError);
}

/*
 * Private methods.
 */

Authentication.prototype.initialize = function()
{
    this.loggedOn = false;
}

Authentication.prototype.keepAlive = function()
{
    RequestManager.getInstance().request('KeepAlive', 'keepalive');
}
