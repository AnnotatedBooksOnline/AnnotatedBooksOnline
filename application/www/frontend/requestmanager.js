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

RequestManager.prototype.flush = function()
{
    var requests  = this.requests;
    this.requests = [];
    
    
    for (var i in requests)
    {
        var request = requests[i];
        
        Ext.Ajax.request({
            url: '/backend/?controller=' + request.controller + '&action=' + request.action,
            params: {
                json: Ext.JSON.encode(request.data)
            },
            method: 'POST',
            success: function(result, req)
            {
                var data = Ext.JSON.decode(result.responseText);
                
                if (request.onSuccess !== undefined)
                {
                    request.onSuccess.call(request.object, data);
                }
            },
            failure: function(result, req)
            {
                var data, message, code, trace;
                
                try
                {
                    data = Ext.JSON.decode(result.responseText);
                    
                    message = data.message;
                    code    = data.code;
                    trace   = data.trace;
                }
                catch (e)
                {
                    data = {
                        code: 'error',
                        message: 'Server error.',
                        trace: result.responseText
                    };
                }
                
                if (request.onError !== undefined)
                {
                    request.onError.call(request.object, code, message, trace);
                }
                else
                {
                    trace = trace || '(not available)';
                    
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'An error occurred, message: \'' + data.message + '\', code: \'' +
                             data.code + '\', stack trace: ' + "\n" + trace,
                        icon: Ext.Msg.ERROR
                    });
                }
            }
        });
    }
}
