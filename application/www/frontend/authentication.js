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
Authentication.prototype.userId;
Authentication.prototype.user;

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
Authentication.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

Authentication.prototype.isLoggedOn = function()
{
    return this.loggedOn;
}

Authentication.prototype.getUserId = function()
{
    return this.loggedOn ? this.userId : 0;
}

Authentication.prototype.getUserModel = function()
{
    return this.user;
}

Authentication.prototype.setUserModel = function(model)
{
    this.user = model;
    
    this.eventDispatcher.trigger('modelchange', this);
}

Authentication.prototype.modelChanged = function()
{
    this.eventDispatcher.trigger('modelchange', this);
}

Authentication.prototype.getFullName = function()
{
    return this.loggedOn ? (this.user.get('firstName') + ' ' + this.user.get('lastName')) : '';
}

Authentication.prototype.requireLogin = function(obj, onSuccess, onError)
{
    // Check if logged on.
    if (this.loggedOn)
    {
        onSuccess.call(obj);
        
        return;
    }
    
    // Check if there is already a login window.
    if (Authentication.loginWindow !== undefined)
    {
        Authentication.loginWindow.addListener(
            'close',
            function()
            {
                if (this.loggedOn)
                {
                    if (onSuccess !== undefined)
                    {
                        onSuccess.call(obj);
                    }
                }
                else if (onError !== undefined)
                {
                    onError.call(obj);
                }
            },
            this
        );
        
        return;
    }
    
    // Show login window.
    var _this = this;
    Authentication.loginWindow = new Ext.ux.LoginWindow({
            listeners: {
                close: function()
                    {
                        if (_this.loggedOn)
                        {
                            if (onSuccess !== undefined)
                            {
                                onSuccess.call(obj);
                            }
                        }
                        else if (onError !== undefined)
                        {
                            onError.call(obj);
                        }
                        
                        Authentication.loginWindow = undefined; 
                    }
            }
        });
    Authentication.loginWindow.show();
}

Authentication.showLoginWindow = function()
{
    // Check if logged on.
    if (Authentication.getInstance().isLoggedOn())
    {
        // Already logged on, bail out.
        return;
    }
    
    // Check if the login window is not already shown.
    if (Authentication.loginWindow !== undefined)
    {
        Ext.WindowManager.bringToFront(Authentication.loginWindow);
        
        return;
    }
    
    // Register action.
    Application.getInstance().addHistoryAction('login');
    
    // Show login window.
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
    
    // Require login for this.
    var authentication = Authentication.getInstance();
    authentication.requireLogin(authentication, function()
        {
            // Register action.
            Application.getInstance().addHistoryAction('editprofile');
            
            // Show profile window.
            Authentication.profileWindow = new Ext.ux.EditProfileWindow({
                    listeners: {
                        close: function() { Authentication.profileWindow = undefined; }
                    }
                });
            Authentication.profileWindow.show();
        });
}

Authentication.prototype.logout = function(showPrompt)
{
    // Logout callback, called after request has been done.
    var callback = function(data)
        {
            // Set us logged out.
            this.loggedOn = false;
            
            // Clear keep-alive interval
            if (this.keepAliveInterval !== undefined)
            {
                clearInterval(this.keepAliveInterval);
                this.keepAliveInterval = undefined;
            }
            
            // Set new user model.
            this.setUserModel(undefined);
            
            // Trigger logout.
            this.eventDispatcher.trigger('change', this);
            this.eventDispatcher.trigger('logout', this);
        };
    
    if (showPrompt !== false)
    {
        var _this = this;
        Ext.Msg.show({
            title: 'Are you sure?',
            msg: 'Are you sure you want to log out?',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            callback: function(button)
                {
                    if (button == 'yes')
                    {
                        // Send logout request.
                        RequestManager.getInstance().request('Authentication', 'logout', {}, _this,
                            callback);
                    }
                }
        });
    }
    else
    {
        // Send logout request without prompting.
        RequestManager.getInstance().request('Authentication', 'logout', {}, this, callback);
    }
}

Authentication.prototype.login = function(username, password, obj, onSuccess, onError)
{
    // Do a login request.
    RequestManager.getInstance().request('Authentication', 'login', {username: username, password: password},
        this,
        function(data)
        {
            // We are logged on.
            this.loggedOn = true;
            
            // Set user id and model.
            this.userId = data.userId;
            
            // Create keep-alive interval.
            var _this = this;
            this.keepAliveInterval = setInterval(function() { _this.keepAlive(); }, 10000);
            
            // Set new user model.
            this.setUserModel(new Ext.ux.UserModel(data));
            
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
