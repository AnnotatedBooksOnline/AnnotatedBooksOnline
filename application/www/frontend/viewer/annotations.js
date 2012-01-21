/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Annotations class.
 *
 * Manages all annotatations. Keeps them in sync with viewer and its store.
 * Knows nothing about polygons. Knows about annotations colors.
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
Annotations.prototype.dirty;

Annotations.prototype.viewer;
Annotations.prototype.viewport;
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
    var color = this.popColor();
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
        
        // Get annotation color.
        var color = this.overlay.getAnnotationColor(annotation);
        
        // Color is available again.
        this.pushColor(color);
        
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
    
    // Trigger clear.
    this.eventDispatcher.trigger('clear', this);
}

// Loads annotations.
Annotations.prototype.load = function()
{
    // Load store. Filter will trigger a load.
    this.store.filter({property: 'scanId', value: this.scanId});
}

// Resets annotations.
Annotations.prototype.reset = function()
{
    // Reload annotations.
    this.load();
    
    // Trigger reset.
    this.eventDispatcher.trigger('reset', this);
}

// Saves annotations.
Annotations.prototype.save = function()
{
    // Get all annotations.
    var annotations = [];
    
    
    /*
    
    for (var i = this.model.fields.items.length - 1; i >= 0; --i)
    {
        var fieldName = this.model.fields.items[i].name;
        
        if (values[fieldName] !== undefined)
        {
            this.model.set(fieldName, values[fieldName]);
        }
    }
    
    */
    
    
    // TODO: Save store: does polygon get transmitted? Nope.
    // NOTE: this.store.sync() might work, but we want revisions, so we may want to do this ourselves.
    
    
    // TODO: Move save below to sync event.
    
    // Trigger save.
    this.eventDispatcher.trigger('save', this);
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
    this.allColors = [
        '#DD0000', // Red.
        '#00DD00', // Green.
        '#0000DD', // Blue.
        '#00DDDD', // Cyan.
        '#DD00DD', // Magenta.
        '#EEEE00', // Yellow.
        '#000000', // Black.
        '#FF8C00', // Orange.
        '#8B0000', // Dark red.
        '#8A2BE2', // Purple.
        '#8B4513', // Brown.
        '#FF4500'  // Red orange.
    ];
    
    // Shuffle array.
    this.allColors.sort(function() { return 0.5 - Math.random(); });
    
    // Copy colors.
    this.availableColors = this.allColors.slice();
    
    // Create store.
    var _this = this;
    this.store = Ext.create('Ext.ux.StoreBase', {
        model: 'Ext.ux.AnnotationModel',
        
        listeners: {
            'add': function(store, models)           { _this.onStoreAdd(models);           },
            'remove': function(store, model)         { _this.onStoreRemove(model);         },
            'beforeload': function(store)            { _this.onStoreBeforeLoad();          },
            'load': function(store, models, success) { _this.onStoreLoad(models, success); },
            'beforesync': function()                 { return false;                       },
            'clear': function()                      { _this.clear();                      },
            'update': function(store, model)         { _this.onStoreDataChanged([model]);  },
            'datachanged': function(store, models)   { _this.onStoreDataChanged(models);   }
            
            // TODO: update vertices? Not for now..
        }
    });
    
    // Create overlay and add it.
    this.overlay = new AnnotationOverlay(this.viewport);
    this.viewport.addOverlay(this.overlay);
    
    // Watch for creation of polygons.
    var overlaygetEventDispatcher = this.overlay.getEventDispatcher();
    overlaygetEventDispatcher.bind('create', this,
        function(event, overlay, annotation) { this.onOverlayCreate(annotation); });
    
    // Watch for erasing of polygons.
    overlaygetEventDispatcher.bind('erase', this,
        function(event, overlay, annotation) { this.onOverlayErase(annotation); });
    
    // Watch for selection of polygons.
    overlaygetEventDispatcher.bind('select', this,
        function(event, overlay, annotation) { this.onOverlaySelect(annotation); });
    
    // Watch for hovering.
    overlaygetEventDispatcher.bind('hover', this,
        function(event, overlay, annotation) { this.onOverlayHover(annotation); });
        
    // Watch for unhovering.
    overlaygetEventDispatcher.bind('unhover', this,
        function(event, overlay, annotation) { this.onOverlayUnhover(annotation); });
        
    // Watch for mode changes.
    overlaygetEventDispatcher.bind('modechange', this,
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
            if (this.scanId !== scanId)
            {
                this.scanId = scanId;
                
                this.load();
            }
        });
    
    // Fetch first annotations.
    this.scanId = this.viewer.getScanId();
    
    this.load();
}

// Fetches a unique color from stack.
Annotations.prototype.popColor = function()
{
    if (this.availableColors.length > 0)
    {
        return this.availableColors.pop();
    }
    else
    {
        // Return random color. Man, I like oneliners.
        // Read 'The Art of Computer Programming' volume 4 fascicle 1 to become a master at
        // bitwise oneliners.
        return '#' + ('00000' + (~~(Math.random() * (1 << 24))).toString(16)).substr(-6);
    }
}

// Inicates that given color is not used anymore.
Annotations.prototype.pushColor = function(color)
{
    this.availableColors.push(color);
}

Annotations.prototype.onOverlayCreate = function(annotation)
{
    // Set its color
    var color = this.popColor();
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
        
        // Get annotation color.
        var color = this.overlay.getAnnotationColor(annotation);
        
        // Color is available again.
        this.pushColor(color);
        
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
        
        // Add annotations.
        this.onStoreAdd(models);
    }
    else
    {
        // Set us dirty.
        this.dirty = true;
        
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
    
    // TODO: What about success?
    
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
        var color = this.popColor();
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
        
        // Get annotation color.
        var color = this.overlay.getAnnotationColor(annotation);
        
        // Color is available again.
        this.pushColor(color);
        
        // Remove annotation.
        this.annotations.splice(index, 1);
        this.overlay.removeAnnotation(annotation);
    }
}
