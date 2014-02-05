/*
 * Compatibility fixes for outdated browsers.
 */

// Implement String.trim() for IE <= 8.
if (typeof String.prototype.trim !== 'function')
{
    String.prototype.trim = function()
    {
        return this.replace(/^\s+|\s+$/g, ''); 
    }
}

