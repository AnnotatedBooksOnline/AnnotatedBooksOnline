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
/*
 * Ext Proxy for the RequestManager.
 * 
 * Requests contain these fields:
 * - action: read, create, update, destroy
 * - params: object describing page, filters, sorters, ...
 *     - page: the current page number
 *     - start: the start row index
 *     - limit: the number of rows to be returned
 *     - filters: the Ext.util.Filter[] to apply
 *     - sorters: the Ext.util.Sorter[] to apply
 * - records: the records (Ext.data.Model[]) to process
 * 
 * Response should contain these fields:
 * - records: the returned data fields
 * - total: the total number of fields in the query (for paging)
 * - success: whether or not the request succeeded (regarding the data, not the server or connection)
 */

Ext.define('Ext.ux.RequestManagerProxy', {
    requires: ['Ext.util.MixedCollection', 'Ext.Ajax'],
    extend: 'Ext.data.proxy.Server',
    alias: 'proxy.requestmanager',
    
    controller: undefined,
    action: undefined,
    
    actionMethods: {
        create : 'POST',
        read   : 'POST',
        update : 'POST',
        destroy: 'POST'
    },
    url: '/backend/', // Just so Ext does not complain.
    reader: {
        type: 'json',
        root: 'records'
    },
    
    doRequest: function(operation, callback, scope) {
        var writer  = this.getWriter(),
            request = this.buildRequest(operation, callback, scope);
            
        if (operation.allowWrite()) {
            request = writer.write(request);
        }
        
        // Just to make things a bit more compliant and less complicated: simulate 'real' ExtJS behaviour.
        Ext.apply(request, {
            headers       : this.headers,
            timeout       : this.timeout,
            scope         : this,
            callback      : this.createRequestCallback(request, operation, callback, scope),
            method        : this.getMethod(request),
            disableCaching: false
        });
        
        var me = this;
        
        function onSuccess(data)
        {
            me.processResponse(true, operation, request, data, callback, this);
        }
        
        function onError(code, message, trace)
        {
            me.processResponse(false, operation, request, 'Error ' + code + ': ' + message, callback, this);
        }

        RequestManager.getInstance().request(this.controller, this.action, {action: operation.action, params: request.params, records: request.jsonData}, scope, onSuccess, onError);

        return request;
    },
    
    getMethod: function(request) {
        return this.actionMethods[request.action];
    },
    
    createRequestCallback: function(request, operation, callback, scope) {
        var me = this;
        
        return function(options, success, response) {
            me.processResponse(success, operation, request, response, callback, scope);
        };
    }
}, function() {
    Ext.data.HttpProxy = this;
});

