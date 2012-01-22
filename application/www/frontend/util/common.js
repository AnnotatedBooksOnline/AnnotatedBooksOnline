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

// Creates a point.
function createPoint(x, y)
{
    return {x: x, y: y};
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

// Clones a point.
function clonePoint(point)
{
    return {x: point.x, y: point.y};
}

function distanceSquared(first, second)
{
    var dx = second.x - first.x;
    var dy = second.y - first.y;
    
    return dx * dx + dy * dy;
}

function distance(first, second)
{
    return Math.sqrt(distanceSquared(first, second));
}

function length(point)
{
    return Math.sqrt(point.x * point.x + point.y * point.y);
}

function dot(first, second)
{
    return first.x * second.x + first.y * second.y;
}

function normalize(point)
{
    var invLength = 1 / length(point);
    
    return {x: point.x * invLength, y: point.y * invLength};
}

// Creates a bounding box.
function createBoundingBox(x, y, width, height)
{
    return {topRight: {x: x, y: y}, bottomLeft: {x: x + width, y: y + height}};
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

// Clones a bounding box.
function cloneBoundingBox(aabb)
{
    var retval = {
        topLeft:     {x: aabb.topLeft.x,     y: aabb.topLeft.y},
        bottomRight: {x: aabb.bottomRight.x, y: aabb.bottomRight.y}
    };
    
    return retval;
}

// Checks whether bounding box intersects another bounding box.
function boundingBoxesIntersect(first, second)
{
    return (first.topLeft.x < second.bottomRight.x) && (first.bottomRight.x >= second.topLeft.x) &&
           (first.topLeft.y < second.bottomRight.y) && (first.bottomRight.y >= second.topLeft.y);
}

// Escapes a string for displaying.
function escape(str)
{
    if (str==null)
    {
        return '';
    }
    
    return str.replace(/&/g, '&amp;').
               replace(/"/g, '&quot;').
               replace(/</g, '&lt;').
               replace(/>/g, '&gt;').
               replace(/\n/g, '<br />');
}

// Gets all cookies.
function getCookies()
{
    var cookies = [];
    
    // Walk through parts.
    var parts = document.cookie.split(";");
    for (var i = parts.length - 1; i >= 0; --i)
    {
        var cookie = parts[i].split('=');
        
        // Trim spaces from name and value, and decode them.
        var name  = decodeURIComponent(cookie[0].replace(/^\s+|\s+$/g, ''));
        var value = decodeURIComponent(cookie[1].replace(/^\s+|\s+$/g, ''));
        
        cookies.push({name: name, value: value});
    }
    
    return cookies;
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

/*
 * Default page size.
 */
 
Ext.override(Ext.data.Store, {
    pageSize: 1000000000 // 'Infinite' page size
});

/*
 * Fix for problematic z-index of setLoading() floating LoadMask.
 */

Ext.override(Ext.AbstractComponent, {
    setLoading: function(load, targetEl)
    {
        var me = this,
            msg;

        if (me.rendered)
        {
            if (load !== false && !me.collapsed)
            {
                if (Ext.isObject(load))
                {
                    throw "This implementation of setLoading does not support a config object.";
                }
                else if (Ext.isString(load))
                {
                    msg = load;
                }
                else
                {
                    msg = "Loading...";
                }
                if (me.loadMask)
                {
                    me.loadMask.unmask();
                }
                me.loadMask = me.loadMask || (targetEl ? me.getTargetEl() : me.el);
                me.loadMask.mask(msg);
            }
            else if (me.loadMask)
            {
                me.loadMask.unmask();
                me.loadMask = null;
            }
        }
    }
});

/*
 * Fix undefined reference in Ext JS.
 */
Ext.getDoc().dom.namespaces = Ext.getDoc().dom.namespaces || {}

