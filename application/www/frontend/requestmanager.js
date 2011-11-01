/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Request manager class.
 */

//class definition
function RequestManager()
{
    //if (arguments.length)
        this.constructor.apply(this, arguments);
}

//members
RequestManager.prototype.timer;
RequestManager.prototype.requests;

//constructor
RequestManager.prototype.constructor = function()
{
    this.requests = [];
}

/*
 * Public methods.
 */

RequestManager.prototype.request = function(controller, action, data, onFinished)
{
    var request = {controller: controller, action: action, data: data, onFinished: onFinished};
    
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
            success: function(result, request)
            {
                var data = Ext.JSON.decode(result.responseText);
                
                
                
                Ext.MessageBox.alert('Success', 'Success!');
            },
            failure: function(result, request)
            {
                var data;
                try
                {
                    data = Ext.JSON.decode(result.responseText);
                }
                catch (e)
                {
                    data = {
                        code: 'error',
                        message: 'Server error.',
                        trace: result.responseText
                    };
                }
                
                var trace = data.trace || '(not available)';
                Ext.MessageBox.alert('Error', 'An error occurred, message: \'' +
                    data.message + '\', code: \'' + data.code + '\', stack trace: ' + "\n" + trace);
            }
        });
    }
}
