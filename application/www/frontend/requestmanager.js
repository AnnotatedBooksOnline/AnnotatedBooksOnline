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
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

//members
RequestManager.prototype.timer;
RequestManager.prototype.requests = [];

//constructor
RequestManager.prototype.constructor = function()
{
}

/*
 * Public methods.
 */

RequestManager.prototype.request = function(data, onFinished)
{
    var request = {data: data, onFinished: onFinished};
    
    requests.push(request);
    
    if (requests.length >= 10)
    {
        this.flush();
    }
    else
    {
        this.timer = setTimeout(function() { this.flush(); }, 10);
    }
}

RequestManager.prototype.flush = function()
{
    var requests  = this.requests;
    this.requests = [];
    
    /*
    var _this = this;
    $.ajax(
        '/backend/',
        {
            context: _this,
            success: function() { }
            error: function() { }
        }
    );
    */
}
