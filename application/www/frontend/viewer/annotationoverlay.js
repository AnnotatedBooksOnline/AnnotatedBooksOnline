/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Annotation overlay class.
 *
 * Interfaces with outside world. Handles loading, saving 
 */

// Class definition.
function AnnotationOverlay(viewport)
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

AnnotationOverlay.prototype = new PolygonOverlay;
AnnotationOverlay.base = PolygonOverlay.prototype;

// Constructor.
AnnotationOverlay.prototype.constructor = function(viewport)
{
    // Create overlay.
    AnnotationOverlay.base.constructor.call(this, viewport);
}

/*
 * Public methods.
 */

//..
