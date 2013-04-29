/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Helper functions.
 */

// Brightens (to white) a 6-digit hex formatted color by the given factor <= 1.
function brighten(color, factor)
{
    var result = '#';
    var chans = /^#?(\w{2})(\w{2})(\w{2})$/.exec(color);
    for (var i = 1; i <= 3; i++)
    {
        var c = parseInt(chans[i], 16);
        c = Math.round((1 - factor) * c + factor * 255);
        c = c.toString(16);
        if (c.length == 1)
        {
            c = '0' + c;
        }
        result += c;
    }
    return result;
};

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
// The escaped string can be safely inserted in HTML element content but should not be used in HTML
// attributes and such.
function escape(str)
{
    if (str === null)
    {
        return '';
    }
    
    return String(str).replace(/&/g,    '&amp;').
                        replace(/"/g,    '&quot;').
                        replace(/</g,    '&lt;').
                        replace(/>/g,    '&gt;').
                        replace('/\//g', '&#x2F').
                        replace(/'/g,    '&#x27').
                        replace(/\r?\n/g,'<br />');
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
        if (cookie.length === 2)
        {
            var name  = decodeURIComponent(cookie[0].replace(/^\s+|\s+$/g, ''));
            var value = decodeURIComponent(cookie[1].replace(/^\s+|\s+$/g, ''));
            
            cookies.push({name: name, value: value});
        }
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

Ext.define('Ext.LoadMask',
{
    extend: 'Ext.util.Observable',
    
    constructor: function(el, config) {
        var me = this;
        
        this.addEvents(
            'beforehide',
            'hide',
            'beforeshow',
            'show',
            'beforedestroy',
            'destroy'
        );
        
        if (el.isComponent)
        {
            me.maskElement = el.getEl();
        }
        else
        {
            me.maskElement = el;
        }
        
        this.superclass.constructor.apply(this, [config]);
        
        if (me.store)
        {
            me.bindStore(me.store, true);
        }
    },

    bindStore : function(store, initial)
    {
        var me = this;

        if (!initial && me.store)
        {
            me.mun(me.store, {
                scope: me,
                beforeload: me.show,
                load: me.hide,
                exception: me.hide
            });
            if (!store)
            {
                me.store = null;
            }
        }
        if (store)
        {
            store = Ext.data.StoreManager.lookup(store);
            me.mon(store, {
                scope: me,
                beforeload: me.show,
                load: me.hide,
                exception: me.hide
            });
        }
        me.store = store;
        if (store && store.isLoading())
        {
            me.show();
        }
    },
    
    enable: function()
    {
        this.show();
    },
    
    disable: function()
    {
        this.hide();
    },

    show: function()
    {
        this.fireEvent('beforeshow', this);
        this.maskElement.mask(this.msg || 'Loading...');
        this.fireEvent('show', this);
    },

    hide: function()
    {
        this.fireEvent('beforehide', this);
        this.maskElement.unmask();
        this.fireEvent('hide', this);
    },
    
    destroy: function()
    {
        this.fireEvent('beforedestroy', this);
        this.hide();
        this.fireEvent('destroy', this);
    }
});

/*
 * Fix undefined reference in Ext JS.
 */
try
{
    document.namespaces = document.namespaces || {};
}
catch(e) { }

/*
 * Add pretty disabled buttons.
 */
Ext.override(Ext.button.Button, {
    setDisabledNoMask: function(disabled)
    {
        this.setDisabled(disabled);
        if (disabled)
        {
            this.removeClsWithUI('disabled');
        }
    }
});

/*
 * Disable panel collapse animations by default.
 */
Ext.override(Ext.panel.Panel, {
    animCollapse: false
});

/*
 * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 * Source: https://github.com/overset/javascript-natural-sort
 *
 * Modified for permanent case insensitivity.
 */
function naturalSort(a, b)
{
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s)
        {
            return (''+s).toLowerCase();
        },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
    {
        if ( xD < yD )
        {
            return -1;
        }
        else if ( xD > yD )
        {
            return 1;
        }
    }
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++)
    {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL))
        {
            return (isNaN(oFxNcL)) ? 1 : -1;
        }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL)
        {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL)
        {
            return -1;
        }
        if (oFxNcL > oFyNcL)
        {
            return 1;
        }
    }
    return 0;
}


