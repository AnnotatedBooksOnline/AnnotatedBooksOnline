/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Binding class.
 */

// Class definition.
function Binding()
{
    if (arguments.length)
    {
        this.constructor.apply(this, arguments);
    }
}

// Fields.
Binding.prototype.model;
Binding.prototype.bindingId;

// Constructor.
Binding.prototype.constructor = function(model)
{
    // Set members.
    this.model     = model;
    this.bindingId = model.get('bindingId');
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Binding.createFromId = function(bindingId, obj, onSuccess, onError)
{
    // On success, 
    var successCallback = function(model)
        {
            var binding = new Binding(model);
            
            onSuccess.call(this, binding);
        };
    
    // Recursively load all information related to this binding.
    Ext.ux.BindingModel.loadRecursive(bindingId, {
        scope: obj,
        success: successCallback,
        failure: onError
    });
}

Binding.prototype.getDocument = function(index)
{
    return Binding.documentFromScan(this.scans[index]);
}

Binding.prototype.getScan = function(index)
{
    return this.scans[index];
}

Binding.prototype.getScanId = function(index)
{
    return this.scans[index].getId();
}

Binding.prototype.getScans = function()
{
    return this.scans;
}

Binding.prototype.getScanAmount = function()
{
    return this.scans.length;
}

Binding.prototype.getModel = function()
{
    return this.model;
}

/*
 * Private methods.
 */

Binding.prototype.initialize = function()
{
    this.scans = this.model.scans().data.items;
}

Binding.documentFromScan = function(scan)
{ 
    var prefix = 'data/tiles/' + scan.get('scanId') + '/tile_';
    
    return new Document(
        scan.get('width'),
        scan.get('height'),
        scan.get('zoomLevel'),
        function(row, col, zoomLevel)
        {
            return prefix + zoomLevel + '_' + col + '_' + row + '.jpg';
        }
    );
}

Binding.prototype.destroy = function()
{
    // Destroy logic can be placed here.
}

