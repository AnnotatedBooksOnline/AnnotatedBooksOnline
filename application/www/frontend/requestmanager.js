/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Request manager class.
 */

// Class definition.
function RequestManager()
{
    //if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
RequestManager.prototype.timer;
RequestManager.prototype.requests;

// Singleton instance.
RequestManager.instance;

// Constructor.
RequestManager.prototype.constructor = function()
{
    this.requests = [];
}

/*
 * Public methods.
 */

RequestManager.getInstance = function()
{
    if (RequestManager.instance === undefined)
    {
        RequestManager.instance = new RequestManager();
    }
    
    return RequestManager.instance;
}

RequestManager.prototype.request = function(controller, action, data, object, onSuccess, onError)
{
    var request = {
        controller: controller,
        action: action,
        data: data,
        object: object,
        onSuccess: onSuccess,
        onError: onError
    };
    this.requests.push(request);
    
    if (this.requests.length >= 10)
    {
        this.flush();
    }
    else
    {
        var _this = this;
        this.timer = setTimeout(function() { _this.flush(); }, 10);
    }
}

/*
 * Private methods.
 */

RequestManager.prototype.flush = function()
{
    var requests  = this.requests;
    this.requests = [];
    
    for (var i = 0; i < requests.length; ++i)
    {
        var _this = this;
        var newScope = function(request)
            {
                Ext.Ajax.request({
                    // Url parameters appended here, because data may be null, in which case
                    // the params would be considered POST parameters instead of GET parameters.
                    url: 'backend/?controller=' + request.controller + '&action=' + request.action,
                    jsonData: request.data,
                    method: 'POST',
                    success: function(result, req)
                    {
                        _this.onRequestFinished(request, true, result.responseText);
                    },
                    failure: function(result, req)
                    {
                        _this.onRequestFinished(request, false, result.responseText);
                    }
                });
            };
        
        // Introduce new scope, see: http://www.mennovanslooten.nl/blog/post/62
        newScope(requests[i]);
    }
}

RequestManager.prototype.onRequestFinished = function(request, success, responseText)
{
    var data, message, code, trace;
    
    // Try to decode response text.
    try
    {
        data = Ext.JSON.decode(responseText);
        
        if (!success)
        {
            message = data.message;
            code    = data.code;
            trace   = data.trace;
        }
    }
    catch (e)
    {
        success = false;
        
        code    = 'error';
        message = 'Server error.';
        trace   = responseText;
    }
    
    // Call the right callback.
    if (success)
    {
        if (request.onSuccess !== undefined)
        {
            request.onSuccess.call(request.object, data);
        }
    }
    else
    {
        // Determine stack trace.
        trace = trace || '(not available)';
        
        // Call error callback.
        if (request.onError !== undefined)
        {
            request.onError.call(request.object, code, message, trace);
        }
        else
        {
            RequestManager.showErrorMessage(code, message, trace);
        }
    }
}

RequestManager.showErrorMessage = function(code, message, trace)
{
    // Let the stack trace stay as HTML, it is a serverside exception.
    var messageContent = escape('An error occurred, message: \'' +
        message + '\', code: \'' + code + '\', stack trace:' + "\n\n") + trace;
    
    Ext.Msg.show({
        title: message,
        msg: messageContent,
        icon: Ext.Msg.ERROR,
        buttons: Ext.Msg.OK
    });
}
