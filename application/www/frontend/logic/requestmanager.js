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
    // Fetch current requests and empty queue.
    var requests  = this.requests;
    this.requests = [];
    
    // Bail if no requests.
    if (requests.length === 0)
    {
        return;
    }
    
    var data, url, onSuccess, onError;
    if (requests.length === 1)
    {
        var request = requests[0];
        
        // Set input data and url.
        data = request.data;
        url  = '?controller=' + request.controller + '&action=' + request.action;
        
        // Set success and error handlers.
        var _this = this;
        onSuccess = function(result, req)
            {
                _this.onRequestFinished(request, true, result.responseText);
            };
        
        onError = function(result, req)
            {
                _this.onRequestFinished(request, false, result.responseText);
            };
    }
    else
    {
        // Set input data.
        data = [];
        for (var i = 0; i < requests.length; ++i)
        {
            var request = requests[i];
            
            // Push data.
            data.push({action: request.action, controller: request.controller, data: request.data});
        }
        
        // Set multi request url.
        url = '?multiple=1';
        
        // Set success and error handlers.
        var _this = this;
        
        onError = function(result, req)
            {
                // Consider all requests failed.
                for (var j = 0; j < requests.length; ++j)
                {
                    _this.onRequestFinished(requests[j], false, result.responseText);
                }
            };
        
        onSuccess = function(result, req)
            {
                // Parse data.
                var data;
                
                try
                {
                    var data = Ext.JSON.decode(result.responseText);
                }
                catch (e)
                {
                    // Call error callback.
                    onError(result, req);
                    
                    return;
                }
                
                // Call finished handler for request.
                for (var j = 0; j < requests.length; ++j)
                {
                    _this.onRequestFinished(requests[j], data[j].success, data[j].data, false);
                }
            };
    }
    
    // Do the actual request.
    var _this = this;
    Ext.Ajax.request({
        url: window.location.pathname + url,
        jsonData: data,
        method: 'POST',
        success: onSuccess,
        failure: onError
    });
}

RequestManager.prototype.onRequestFinished = function(request, success, response, decode)
{
    var data, message, code, trace;
    
    // Try to decode response text.
    try
    {
        // Decode data.
        data = (decode !== false) ? Ext.JSON.decode(response) : response;
        
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
        trace   = response;
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
        // Call error callback.
        var result;
        if (request.onError !== undefined)
        {
            result = request.onError.call(request.object, code, message, trace);
        }
        
        // Show an error if error handler did not handle this error.
        if (result !== false)
        {
            RequestManager.showErrorMessage(code, message, trace);
        }
    }
}

RequestManager.showErrorMessage = function(code, message, trace)
{
    var messageContent = escape('An error occurred, message: \'' +
        message + '\', code: \'' + code + '\''); 
    
    // Add stack trace, if present.
    if(trace)
    {
        // Let the stack trace stay as HTML, it is a serverside exception.
        messageContent += escape(', stack trace:' + "\n\n") + trace;
    }
    else
    {
        messageContent += escape(".\n\n");
    }
    
    Ext.Msg.show({
        title: message,
        msg: messageContent,
        icon: Ext.Msg.ERROR,
        buttons: Ext.Msg.OK
    });
}
