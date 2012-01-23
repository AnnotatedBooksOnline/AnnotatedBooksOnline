/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Overlay class.
 */

// Class definition.
function Overlay()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

Overlay.prototype = new DomNode;
Overlay.base = DomNode.prototype;

// Fields.
Overlay.prototype.position;
Overlay.prototype.rotation      = 0;
Overlay.prototype.zoomLevel     = 0;
Overlay.prototype.zoomFactor    = 1;
Overlay.prototype.invZoomFactor = 1;

// Constructor.
Overlay.prototype.constructor = function()
{
    // Create dom.
    Overlay.base.constructor.call(this, '<div class="overlay"></div>');
    
    // Set position.
    this.position = {x: 0, y: 0};
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Overlay.prototype.update = function(position, zoomLevel, rotation, area)
{
    this.position      = position;
    this.rotation      = rotation;
    this.zoomLevel     = zoomLevel;
    this.zoomFactor    = Math.pow(2, zoomLevel);
    this.invZoomFactor = 1 / this.zoomFactor;
}

Overlay.prototype.transformPoint = function(point)
{
    // Get offset of viewport dom.
    var domOffset = this.dom.offset();
    
    // Calculate point within overlay in viewport dimensions.
    var point = {
        x: (point.x - domOffset.left) * this.invZoomFactor + this.position.x,
        y: (point.y - domOffset.top)  * this.invZoomFactor + this.position.y
    };
    
    // Rotate point back to document coordinates.
    return rotatePoint(point, -this.rotation);
}

/*
 * Private methods.
 */

Overlay.prototype.initialize = function()
{
    // Implement in subclass.
}
