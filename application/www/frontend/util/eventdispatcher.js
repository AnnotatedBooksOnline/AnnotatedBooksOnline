/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Event dispatcher class.
 */

// Class definition.
function EventDispatcher()
{
    this.constructor();
}

// Fields.
EventDispatcher.prototype.events;

// Constructor.
EventDispatcher.prototype.constructor = function()
{
    this.events = {};
}

/*
 * Public methods.
 */

EventDispatcher.prototype.bind = function(event, obj, method)
{
    var listeners = this.events[event];
    if (listeners === undefined)
    {
        listeners = this.events[event] = [];
    }
    
    listeners.push({method: method, obj: obj});
}

EventDispatcher.prototype.unbind = function(event, obj, method)
{
    var listeners = this.events[event];
    if (listeners === undefined)
    {
        return;
    }
    
    for (var i = 0; i < listeners.length; ++i)
    {
        if ((listeners[i].method === method) && (listeners[i].obj === obj))
        {
            listeners.splice(i, 1);
        }
    }
}

EventDispatcher.prototype.trigger = function(event)
{
    var listeners = this.events[event];
    if (listeners === undefined)
    {
        return;
    }
    
    for (var i = 0; i < listeners.length; ++i)
    {
        var listener = listeners[i];
        
        try
        {
            listener.method.apply(listener.obj, arguments);
        }
        catch (e) { }
    }
}
