/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Message bar class.
 */

// Class definition.
function MessageBar()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

MessageBar.prototype = new DomNode;
MessageBar.base = DomNode.prototype;

// Fields.
MessageBar.prototype.text;
MessageBar.prototype.timeOut;
MessageBar.prototype.closed;

// Statics.
MessageBar.bars;

// Constructor.
MessageBar.prototype.constructor = function(text, timeOut)
{
    // Set fields.
    this.text    = text;
    this.closed  = false;
    this.timeOut = timeOut;
    
    // Create dom.
    MessageBar.base.constructor.call(this,
        '<div class="message-bar" title="Click to close">' + escape(text) + '</div>');
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

MessageBar.show = function(text, timeOut)
{
    // Create message bar element, which holds all message bars.
    if (MessageBar.bars === undefined)
    {
        MessageBar.bars = new DomNode('<div class="message-bars" />');
        MessageBar.bars.insert(document.body);
    }
    
    // Create new message bar.
    return new MessageBar(text, timeOut);
}

MessageBar.prototype.close = function()
{
    // Check if already closed.
    if (this.closed)
    {
        return;
    }
    
    // Animaet sliding up.
    var _this = this;
    this.dom.slideUp('fast', function() { _this.destroy(); });
    
    // We are closed.
    this.closed = true;
}

/*
 * Private methods.
 */

MessageBar.prototype.initialize = function()
{
    // Insert us into the message bars element, before other bars.
    this.insert(MessageBar.bars, MessageBar.bars.getDom().children().first());
    
    // Animate us.
    this.dom.hide();
    this.dom.slideDown('fast');
    
    // Add an onclick event.
    var _this = this;
    this.dom.bind('click', function() { _this.close(); });
    
    // Set time out.
    if (this.timeOut > 0)
    {
        setTimeout(function() { _this.close(); }, this.timeOut);
    }
}
