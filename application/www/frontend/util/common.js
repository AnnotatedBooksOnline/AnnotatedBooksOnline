/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Helper functions.
 */

// Stops a browser event from bubbling up.
function cancelEvent(event)
{
    event = event || window.event;
    
    if (event.stopPropagation)
        event.stopPropagation();
    
    if (event.preventDefault)
        event.preventDefault();
    
    event.cancelBubble = true;
    event.cancel       = true;
    event.returnValue  = false;
    
    return false;
}

// Rotates a point by an angle.
function rotatePoint(point, angle)
{
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    
    var result = {
        x: point.x * cos - point.y * sin,
        y: point.x * sin + point.y * cos
    };
    
    return result;
}

// Gets bounding box of a rotated bounding box.
function rotateBoundingBox(aabb, angle)
{
    // Calculate topright and bottomleft.
    var topRight    = {x: aabb.bottomRight.x, y: aabb.topLeft.y};
    var bottomLeft  = {x: aabb.topLeft.x, y: aabb.bottomRight.y};
    
    // Rotate points, and set new topleft and bottomright.
    var rotatedTopLeft     = rotatePoint(aabb.topLeft,     angle);
    var rotatedBottomRight = rotatePoint(aabb.bottomRight, angle);
    var rotatedTopRight    = rotatePoint(topRight,         angle);
    var rotatedBottomLeft  = rotatePoint(bottomLeft,       angle);
    
    var topLeft = {
        x: Math.min(Math.min(rotatedTopLeft.x, rotatedBottomRight.x),
                    Math.min(rotatedTopRight.x, rotatedBottomLeft.x)),
        y: Math.min(Math.min(rotatedTopLeft.y, rotatedBottomRight.y),
                    Math.min(rotatedTopRight.y, rotatedBottomLeft.y))
    };
    
    var bottomRight = {
        x: Math.max(Math.max(rotatedTopLeft.x, rotatedBottomRight.x),
                    Math.max(rotatedTopRight.x, rotatedBottomLeft.x)),
        y: Math.max(Math.max(rotatedTopLeft.y, rotatedBottomRight.y),
                    Math.max(rotatedTopRight.y, rotatedBottomLeft.y))
    };
    
    return {topLeft: topLeft, bottomRight: bottomRight};
}

// Escapes a string for displaying.
function escape(str)
{
    return str.replace(/&/g, '&amp;').
               replace(/"/g, '&quot;').
               replace(/</g, '&lt;').
               replace(/>/g, '&gt;').
               replace(/\n/g, '<br />');
}

/*
 * Browser detection.
 */

var isIE = navigator.userAgent.indexOf("MSIE")    != -1;
var isFF = navigator.userAgent.indexOf("Firefox") != -1;

/*
 * Feature detection.
 */

var hasTransforms = Modernizr.csstransforms;
