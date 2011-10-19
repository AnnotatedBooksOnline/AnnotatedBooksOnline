/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Event dispatcher class.
 */

function EventDispatcher()
{
	this.constructor();
}

//members
EventDispatcher.prototype.events = {};

//methods
EventDispatcher.prototype.constructor = function()
{
}

EventDispatcher.prototype.bind = function(event, method, obj)
{
	var listeners = this.events[event];
	if (listeners === undefined)
		listeners = this.events[event] = [];
	
	listeners.push({method: method, obj: obj});
}

EventDispatcher.prototype.unbind = function(event, listener, obj)
{
	var listeners = this.events[event];
	if (listeners === undefined)
		return;
	
	for (var i = 0; i < listeners.length; ++i)
	{
		if ((listeners[i].method == listener) && (listeners[i].obj == obj))
			listeners.splice(i, 1);
	}
}

EventDispatcher.prototype.trigger = function(event)
{
	var listeners = this.events[event];
	if (listeners === undefined)
		return;
	
	for (var i = 0; i < listeners.length; ++i)
	{
		var listener = listeners[i];
		
		listener.method.apply(listener.obj, arguments);
	}
}
