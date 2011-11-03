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
            // Url parameters appended here, because data may be null, in which case
            // the params would be considered POST parameters instead of GET parameters.
            url: '/backend/?controller=' + request.controller + '&action=' + request.action,
            jsonData: request.data,
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
                        icon: Ext.Msg.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        });
    }
}
/*
 * Ext Proxy for the RequestManager.
 *
 * Request controller must be a proxy setting.
 * Request action is determined according to operation action: read, create, update, destroy.
 * 
 * Requests contain these fields:
 * - id: The id of the model to fetch.
 * - page: The current page number.
 * - start: The start row index.
 * - limit: The number of rows to be returned.
 * - filters: The Ext.util.Filter[] to apply.
 * - sorters: The Ext.util.Sorter[] to apply.
 * - records: The records (Ext.data.Model[]) to process.
 * 
 * Response should contain these fields:
 * - records: The returned data fields.
 * - total: The total number of fields in the query (for paging).
 * - success: Whether or not the request succeeded (regarding the data, not the server or connection).
 */

Ext.define('Ext.ux.RequestManagerProxy', {
    requires: ['Ext.util.MixedCollection', 'Ext.Ajax'],
    extend: 'Ext.data.proxy.Server',
    alias: 'proxy.requestmanager',
    
    controller: undefined,
    
    url: '/backend/', // Just so Ext does not complain.
    reader: {
        type: 'json',
        root: 'records'
    },
    
    doRequest: function(operation, callback, scope)
    {
        var writer  = this.getWriter(),
            request = this.buildRequest(operation, callback, scope);
        
        if (operation.allowWrite())
        {
            request = writer.write(request);
        }
        
        // Just to make things a bit more compliant and less complicated: simulate 'real' ExtJS behaviour.
        Ext.apply(request, {
            headers:       this.headers,
            timeout:       this.timeout,
            scope:         scope,
            callback:      this.createRequestCallback(request, operation, callback, scope),
            method:        'POST',
            disableCaching: false
        });
        
        var _this = this;
        function onSuccess(data)
        {
            _this.processResponse(true, operation, request, data, callback, scope);
        }
        
        function onError(code, message, trace)
        {
            var msg = 'An error occurred, message: \'' + data.message + '\', code: \''
                    + data.code + '\', stack trace: ' + "\n" + trace;
            
            _this.processResponse(false, operation, request, msg, callback, scope);
        }
        
        // Determine data to send.
        var data = {records: request.jsonData};
        Ext.apply(data, request.params);

        // Determine action to use.
        var action;
        switch (operation.action)
        {
            case 'read':    action = 'load';   break;
            case 'update':  action = 'save';   break;
            case 'create':  action = 'create'; break;
            case 'destroy': action = 'delete'; break;
            default:        aciont = 'load';   break;
        }
        
        // Send request.
        RequestManager.getInstance().request(
            this.controller,
            action,
            data,
            scope,
            onSuccess,
            onError
        );

        return request;
    },
    
    createRequestCallback: function(request, operation, callback, scope)
    {
        var _this = this;
        return function(options, success, response)
        {
            _this.processResponse(success, operation, request, response, callback, scope);
        };
    }
});

