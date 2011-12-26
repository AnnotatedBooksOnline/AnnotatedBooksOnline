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
    
    this.userId   = 0;
    this.loggedOn = false;
}

/*
 * Public methods.
 */

Authentication.getInstance = function()
{
    if (Authentication.instance === undefined)
    {
        Authentication.instance = new Authentication();
    
        // Initialize here, so that methods that need an instance of the singleton
        // will get it without recursively initializing.
        Authentication.instance.initialize();
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
    return this.userId;
}

Authentication.prototype.getUserModel = function()
{
    return this.user;
}

Authentication.prototype.setUserModel = function(model)
{
    // Set model.
    this.user = model;
    
    // Set user id.
    this.userId = model ? model.get('userId') : 0;
    
    this.eventDispatcher.trigger('modelchange', this);
}

Authentication.prototype.modelChanged = function()
{
    // Refetch user id.
    this.userId = this.user.get('userId');
    
    this.eventDispatcher.trigger('modelchange', this);
}

Authentication.prototype.getFullName = function()
{
    return this.loggedOn ? this.user.getFullName() : '';
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
    // Check if logged on.
    if (!this.loggedOn)
    {
        return;
    }
    
    // Logout callback, called after request has been done.
    var callback = function(data)
        {
            // Set us logged out.
            this.loggedOn = false;
            
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
                        RequestManager.getInstance().request('Authentication', 'logout', null,
                            _this, callback);
                    }
                }
        });
    }
    else
    {
        // Send logout request without prompting.
        RequestManager.getInstance().request('Authentication', 'logout', null, this, callback);
    }
}

Authentication.prototype.login = function(username, password, obj, onSuccess, onError)
{
    // Do a login request.
    RequestManager.getInstance().request(
        'Authentication',
        'login',
        {username: username, password: password},
        this,
        function(data)
        {
            // Log in.
            this.loginInternally(data);
            
            // Call success handler
            if (onSuccess !== undefined)
            {
                onSuccess.call(obj);
            }
        }, onError
    );
}

Authentication.prototype.checkPassword = function(password, obj, onSuccess, onError)
{
    // Do a check password request.
    RequestManager.getInstance().request(
        'Authentication',
        'checkPassword',
        {password: password},
        obj,
        onSuccess,
        onError
    );
}

/*
 * Private methods.
 */

Authentication.prototype.initialize = function()
{
    // Create keep-alive interval.
    this.keepAlive();
}

Authentication.prototype.keepAlive = function()
{
    var data = {userId: this.loggedOn ? this.userId : 0};
    RequestManager.getInstance().request('Authentication', 'keepalive', data, this,
        function(data) // Callback on success.
        {
            // Check if there is a mismatch between client and server.
            if (data && data.action)
            {
                if (data.action == 'logout')
                {
                    if (this.loggedOn)
                    {
                        // TODO: make special time out window, that by deactivation will close.
                        
                        // Show login window, to give the user one last chance.
                        this.loggedOn = false;
                        this.requireLogin(this,
                            function()
                            {
                                // User logged in, keep alive.
                                this.keepAlive();
                            },
                            function()
                            {
                                // Use cancelled, logout and keep alive.
                                this.loggedOn = true;
                                this.logout(false);
                                this.keepAlive();
                            }, true);
                        
                        // Skip current time out.
                        return;
                    }
                }
                else if (data.action == 'login')
                {
                    // Log in with new or different credentials.
                    this.loginInternally(data.user);
                }
            }
            
            // Keep alive in 10 seconds.
            var _this = this;
            setTimeout(function() { _this.keepAlive(); }, 10000);
        },
        function(data) // Callback on failure.
        {
            // There is nothing we can do. Try again in 10 seconds.
            var _this = this;
            setTimeout(function() { _this.keepAlive(); }, 10000);
            
            return false;
        });
}

Authentication.prototype.loginInternally = function(user)
{
    // We are logged on.
    this.loggedOn = true;
    
    // Set new user model.
    this.setUserModel(new Ext.ux.UserModel(user));
    
    // Trigger login.
    this.eventDispatcher.trigger('change', this);
    this.eventDispatcher.trigger('login', this);
    
    // Close login window if open.
    if (Authentication.loginWindow !== undefined)
    {
        Authentication.loginWindow.close();
        Authentication.loginWindow = undefined;
    }
}
