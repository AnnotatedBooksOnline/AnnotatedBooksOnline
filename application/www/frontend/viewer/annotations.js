/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Annotations class.
 *
 * Manages all annotatations. Keeps them in sync with viewer and its store.
 * Knows nothing about polygons. Knows about annotations colors.
 * Owns annotations, annotation store and annotation overlay.
 */

// Class definition.
function Annotations()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Annotations.prototype.eventDispatcher;

Annotations.prototype.mode;
Annotations.prototype.enabled;
Annotations.prototype.loading;
Annotations.prototype.saving;
Annotations.prototype.dirty;

Annotations.prototype.viewer;
Annotations.prototype.viewport;
Annotations.prototype.loadScanId;
Annotations.prototype.scanId;

Annotations.prototype.overlay;

Annotations.prototype.annotations;

Annotations.prototype.availableColors;

// Constructor.
Annotations.prototype.constructor = function(viewer)
{
    // Set members.
    this.eventDispatcher = new EventDispatcher();
    
    this.viewer   = viewer;
    this.viewport = viewer.getViewport();
    this.enabled  = true;
    this.loading  = false;
    this.saving   = false;
    this.mode     = 'view';
    this.dirty    = false;
    
    this.annotations = [];
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Annotations.prototype.getEventDispatcher = function()
{
    return this.eventDispatcher;
}

Annotations.prototype.hasChanges = function()
{
    return this.dirty;
}

Annotations.prototype.getAnnotation = function(index)
{
    return this.annotations[index];
}

Annotations.prototype.getAnnotationIndex = function(annotation)
{
    for (var i = this.annotations.length - 1; i >= 0; --i)
    {
        if (this.annotations[i] === annotation)
        {
            return i;
        }
    }
    
    return -1;
}

Annotations.prototype.getAnnotationIndexByModel = function(model)
{
    for (var i = this.annotations.length - 1; i >= 0; --i)
    {
        if (this.annotations[i].getModel() === model)
        {
            return i;
        }
    }
    
    return -1;
}

Annotations.prototype.getAnnotationByModel = function(model)
{
    var index = this.getAnnotationIndexByModel(model);
    return (index >= 0) ? this.annotations[index] : null;
}

Annotations.prototype.getColor = function(annotation)
{
    if (annotation && annotation.getColorNumber)
    {
        var color = annotation.getColorNumber();
        if (color >= this.availableColors.length || color < 0)
        {
            return this.availableColors[0];
        }
        return this.availableColors[color];
    }
    return this.availableColors[0];
}

Annotations.prototype.getAvailableColors = function()
{
    return this.availableColors.slice();
}

Annotations.prototype.highlightAnnotation = function(annotation)
{
    this.overlay.highlightAnnotation(annotation);
}

Annotations.prototype.unhighlightAnnotation = function(annotation)
{
    this.overlay.unhighlightAnnotation(annotation);
}

Annotations.prototype.editAnnotation = function(annotation)
{
    this.overlay.editAnnotation(annotation);
}

Annotations.prototype.uneditAnnotation = function(annotation)
{
    this.overlay.uneditAnnotation(annotation);
}

Annotations.prototype.getAnnotationColor = function(annotation)
{
    return this.overlay.getAnnotationColor(annotation);
}

Annotations.prototype.addAnnotation = function(annotation)
{
    // Add it.
    this.annotations.push(annotation);
    
    // Add it to overlay.
    var color = this.getColor(annotation);
    this.overlay.addAnnotation(annotation, false, color);
    
    // Add to store, but skip event.
    this.skipStoreAddEvent = true;
    this.store.add(annotation.getModel());
    
    // Trigger add.
    this.eventDispatcher.trigger('add', this, annotation);
}

Annotations.prototype.removeAnnotation = function(annotation)
{
    // Search for annotation.
    var index = this.getAnnotationIndex(annotation);
    if (index >= 0)
    {
        // Trigger remove.
        this.eventDispatcher.trigger('remove', this, annotation);
        
        // Remove annotation.
        this.annotations.splice(index, 1);
        this.overlay.removeAnnotation(annotation);
        
        // Remove from store, but skip event.
        this.skipStoreRemoveEvent = true;
        this.store.remove(annotation.getModel());
    }
}

// Enables annotations.
Annotations.prototype.enable = function()
{
    if (this.enabled !== true)
    {
        this.viewport.addOverlay(this.overlay);
        
        this.enabled = true;
        
        // Trigger enable.
        this.eventDispatcher.trigger('enable', this);
    }
}

// Disables annotations.
Annotations.prototype.disable = function()
{
    if (this.enabled === true)
    {
        this.viewport.removeOverlay(this.overlay);
        
        this.enabled = false;
        
        // Trigger enable.
        this.eventDispatcher.trigger('disable', this);
    }
}

// Clears annotations.
Annotations.prototype.clear = function()
{
    // Remove all polygons.
    this.overlay.clear();
    
    this.annotations = [];
    
    // All colors are available again.
    this.availableColors = this.allColors.slice();
    
    // Clear store.
    this.store.removeAll();
    
    // Set us dirty.
    this.dirty = true;
    
    // Trigger clear.
    this.eventDispatcher.trigger('clear', this);
}

// Loads annotations.
Annotations.prototype.load = function(force)
{
    // Check whether not yet loading.
    if (this.loading)
    {
        return;
    }
    
    // Ask user whether to save changes.
    if (!this.saving && this.dirty && (force !== true))
    {
        var _this = this;
        Ext.Msg.confirm('Save changes?', 'Do you want to save changes?', 
            function(button)
            {
                if (button === 'yes')
                {
                    // Save changes.
                    _this.save();
                }
                
                // Let's load some annotations.
                _this.load(true);
            });
        
        return;
    }
    
    // Trigger before load event.
    this.eventDispatcher.trigger('beforeload', this);
    
    // Wait until we are not saving anymore.
    var _this = this;
    var loadData = function()
    {
        // Check if saving.
        if (_this.saving)
        {
            setTimeout(loadData, 100);
            return;
        }
        
        // Load store. Filter will trigger a load.
        _this.store.filters.clear();
        _this.store.sort('order', 'ASC', 'append', false);
        _this.store.filter('scanId', _this.loadScanId);
    };
    
    loadData();
}

// Resets annotations.
Annotations.prototype.reset = function(force)
{
    // Check for changes.
    if (!this.dirty && !force)
    {
        return;
    }
    
    // Reload annotations.
    this.load(true);
    
    // Trigger reset.
    this.eventDispatcher.trigger('reset', this);
}

// Saves annotations.
Annotations.prototype.save = function()
{
    // Check for changes. And whether we are loading or saving. And whether we have loaded.
    if (!this.dirty || this.loading || this.saving || (this.scanId === undefined))
    {
        return;
    }
    
    // Get all annotations.
    var annotations = [];
    
    this.store.data.each(
        function(model)
        {
            // Determine polygon.
            var polygon = [];
            model.polygon().data.each(
                function(vertex)
                {
                    polygon.push({x: vertex.get('x'), y: vertex.get('y')});
                });
            
            // Add annotation.
            annotations.push({
                annotationId: model.get('annotationId'),
                annotationInfo: model.get('annotationInfo'),
                polygon: polygon
            });
        });
    
    // Set data.
    var data = {
        scanId: this.scanId,
        annotations: annotations
    };
    
    // Set us saving.
    this.saving = true;
    
    // Send save request.
    RequestManager.getInstance().request('Annotation', 'save', data, this,
        function(annotationIds)
        {
            // Set annotation ids on the models.
            for (var i = 0; i < annotations.length; ++i)
            {
                this.annotations[i].getModel().set('annotationId', annotationIds[i]);
            }
            
            // Set us not saving.
            this.saving = false;
            
            // Set us not dirty.
            this.dirty = false;
            
            // Trigger save.
            this.eventDispatcher.trigger('save', this);
        });
}

// Sets annotation mode.
Annotations.prototype.setMode = function(mode)
{
    // Check existing mode.
    if (mode === this.mode)
    {
        return;
    }
    
    // Check whether permission to add annotations. If not, mode must be view.
    if ((mode !== 'view') && !Authentication.getInstance().hasPermissionTo('add-annotations'))
    {
        return;
    }
    
    // Save mode and set mode on overlay.
    this.mode = mode;
    this.overlay.setMode(mode);
}

// Fetches annotation store.
Annotations.prototype.getStore = function()
{
    return this.store;
}

/*
 * Private methods.
 */

Annotations.prototype.initialize = function()
{
    // Set available colors.
    var brightColors = [
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFF00',
        '#00FFFF',
        '#FF00FF'
    ];
    var darkColors = [
        '#550000',
        '#005500',
        '#000055',
        '#555500',
        '#005555',
        '#550055'
    ];
    this.allColors = ['#AAAAAA'].concat(darkColors, brightColors);
    
    // Copy colors.
    this.availableColors = this.allColors.slice();
    
    // Create store.
    var _this = this;
    this.store = Ext.create('Ext.ux.StoreBase', {
        model: 'Ext.ux.AnnotationModel',
        pageSize: 10000,
        
        listeners: {
            'add': function(store, models)           { _this.onStoreAdd(models);           },
            'remove': function(store, model)         { _this.onStoreRemove(model);         },
            'beforeload': function(store)            { _this.onStoreBeforeLoad();          },
            'load': function(store, models, success) { _this.onStoreLoad(models, success); },
            'beforesync': function()                 { return false;                       },
            'clear': function()                      { _this.clear();                      },
            'update': function(store, model)         { _this.onStoreDataChanged([model]);  },
            'datachanged': function(store, models)   { _this.onStoreDataChanged(models);   }
            
        }
    });
    
    // Create overlay and add it.
    this.overlay = new AnnotationOverlay(this.viewport);
    
    // Watch for creation of polygons.
    var overlayEventDispatcher = this.overlay.getEventDispatcher();
    overlayEventDispatcher.bind('create', this,
        function(event, overlay, annotation) { this.onOverlayCreate(annotation); });
    
    // Watch for erasing of polygons.
    overlayEventDispatcher.bind('erase', this,
        function(event, overlay, annotation) { this.onOverlayErase(annotation); });
    
    // Watch for changing of polygons.
    overlayEventDispatcher.bind('change', this,
        function(event, overlay, annotation) { this.onOverlayChange(annotation); });
    
    // Watch for selection of polygons.
    overlayEventDispatcher.bind('select', this,
        function(event, overlay, annotation) { this.onOverlaySelect(annotation); });
    
    // Watch for hovering.
    overlayEventDispatcher.bind('hover', this,
        function(event, overlay, annotation) { this.onOverlayHover(annotation); });
     
    // Watch for unhovering.
    overlayEventDispatcher.bind('unhover', this,
        function(event, overlay, annotation) { this.onOverlayUnhover(annotation); });
    
    // Watch for mode changes.
    overlayEventDispatcher.bind('modechange', this,
        function(event, overlay, mode)
        {
            if (this.mode !== mode)
            {
                // Save mode.
                this.mode = mode;
        
                // Trigger mode change.
                this.eventDispatcher.trigger('modechange', this, mode);
            }
        });
    
    // Watch for page changes.
    this.viewer.getEventDispatcher().bind('pagechange', this,
        function(pageNumber)
        {
            // Check if scan has really changed.
            var scanId = this.viewer.getScanId();
            if (this.loadScanId !== scanId)
            {
                this.loadScanId = scanId;
                
                this.load();
            }
        });
    
    // Fetch first annotations.
    this.loadScanId = this.viewer.getScanId();
    
    this.load();
}

Annotations.prototype.onOverlayCreate = function(annotation)
{
    // Set its color
    var color = this.getColor(annotation);
    this.overlay.setAnnotationColor(annotation, color);
    
    // Add it.
    this.annotations.push(annotation);
    
    // Add to store, but skip event.
    this.skipStoreAddEvent = true;
    this.store.add(annotation.getModel());
    
    // Trigger add.
    this.eventDispatcher.trigger('add', this, annotation);
}

Annotations.prototype.onOverlayErase = function(annotation)
{
    // Search for annotation.
    var index = this.getAnnotationIndex(annotation);
    if (index >= 0)
    {
        // Trigger remove.
        this.eventDispatcher.trigger('remove', this, annotation);
                
        // Remove annotation.
        this.annotations.splice(index, 1);
        
        // Remove from store.
        this.skipStoreRemoveEvent = true;
        this.store.remove(annotation.getModel());
    }
}

Annotations.prototype.onOverlaySelect = function(annotation)
{
    // Trigger select.
    this.eventDispatcher.trigger('select', this, annotation);
}

Annotations.prototype.onOverlayChange = function(annotation)
{
    // Set us dirty.
    this.dirty = true;
    // Trigger change.
    this.eventDispatcher.trigger('change', this);
}

Annotations.prototype.onOverlayHover = function(annotation)
{
    // Trigger hover.
    this.eventDispatcher.trigger('hover', this, annotation);
}

Annotations.prototype.onOverlayUnhover = function(annotation)
{
    // Trigger unhover.
    this.eventDispatcher.trigger('unhover', this, annotation);
}

Annotations.prototype.onStoreBeforeLoad = function()
{
    // We have started loading.
    this.loading = true;
    
    // Remove overlay for a moment.
    this.viewport.removeOverlay(this.overlay);
}

Annotations.prototype.onStoreDataChanged = function(models)
{
    // Yup, datachanged event goes off before load event.
    if (this.loading)
    {
        // Remove all polygons.
        this.overlay.clear();
        this.annotations = [];
        
        // All colors are available again.
        this.availableColors = this.allColors.slice();
        
        // Trigger clear.
        this.eventDispatcher.trigger('clear', this);
        
        // Set scan id.
        this.scanId = this.loadScanId;
        
        // Add annotations.
        this.onStoreAdd(models);
    }
    else
    {
        // Set us dirty.
        this.dirty = true;
        // Update annotation colors.
        for (var i = 0; i < models.length; i++)
        {
            var model = models[i];
            var annotation = this.getAnnotationByModel(model);
            var color = this.getColor(annotation);
            this.overlay.setAnnotationColor(annotation, color);
        }
        
        // Trigger change.
        this.eventDispatcher.trigger('change', this);
    }
}

Annotations.prototype.onStoreLoad = function(models, success)
{
    // We have stopped loading.
    this.loading = false;
    
    // Reset dirty marker.
    this.dirty = false;
    this.getStore().removed = [];
    
    // Show overlay again.
    this.viewport.addOverlay(this.overlay);
    
    // Models have already been added by datachanged event handler.
    
    // Trigger load.
    this.eventDispatcher.trigger('load', this);
}

Annotations.prototype.onStoreAdd = function(models)
{
    // Check if it needs skipped.
    if (this.skipStoreAddEvent === true)
    {
        this.skipStoreAddEvent = undefined;
        return;
    }
    
    // Walk through models.
    for (var i = 0; i < models.length; ++i)
    {
        // Create annotation.
        var annotation = new Annotation(models[i]);
        
        // Add it to overlay.
        var color = this.getColor(annotation);
        this.overlay.addAnnotation(annotation, false, color);
        
        // Add it.
        this.annotations.push(annotation);
        
        // Trigger add.
        this.eventDispatcher.trigger('add', this, annotation);
    }
}

Annotations.prototype.onStoreRemove = function(model)
{
    // Check if it needs skipped.
    if (this.skipStoreRemoveEvent === true)
    {
        this.skipStoreRemoveEvent = undefined;
        return;
    }
    
    // Search for annotation.
    var index = this.getAnnotationIndexByModel(model);
    if (index !== null)
    {
        // Trigger remove.
        var annotation = this.annotations[index];
        this.eventDispatcher.trigger('remove', this, annotation);
        
        // Remove annotation.
        this.annotations.splice(index, 1);
        this.overlay.removeAnnotation(annotation);
    }
}

Annotations.prototype.destroy = function()
{
    // Destroy overlay.
    this.overlay.destroy();
}

