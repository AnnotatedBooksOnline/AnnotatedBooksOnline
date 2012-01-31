/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Dom node class.
 */

//class definition
function DomNode()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

//members
DomNode.prototype.dom;

//constructor
DomNode.prototype.constructor = function(dom)
{
    this.dom = $(dom);
}

/*
 * Public methods.
 */

DomNode.prototype.insert = function(element, before)
{
    element = (element.dom !== undefined) ? element.dom.get(0) : $(element).get(0);
    
    if (before !== undefined)
    {
        before = (before.dom !== undefined) ? before.dom.get(0) : $(before).get(0);
    }
    else
    {
        before = null;
    }
    
    if (before)
    {
        element.insertBefore(this.dom.get(0), before);
    }
    else
    {
        element.appendChild(this.dom.get(0));
    }
}

DomNode.prototype.remove = function()
{
    var element = this.dom.get(0);
    
    element.parentNode.removeChild(element);
}

DomNode.prototype.getDom = function()
{
    return this.dom;
}

DomNode.prototype.destroy = function()
{
    this.dom.remove();
}
