/*
 * Navigation panel class.
 */

Ext.define('Ext.ux.ThumbnailView', {
    extend: 'Ext.view.View',
    alias: 'widget.thumbnailview',
    
    initComponent: function()
    {
        // Fetch binding.
        this.binding = this.viewer.getBinding();
        
        // Set fields.
        var fields = [];
        for (var i = 0; i < this.binding.getScanAmount(); i++)
        {
            var scan = this.binding.getScans()[i];
            
            var thumbnail = 'data/thumbnails/' + scan.get('scanId') + '.jpg';
            
            fields[i] = [
                scan.get('scanId'),
                thumbnail,
                i
            ];
        }
        
        // Create store.
        var store = Ext.create('Ext.data.ArrayStore', {
            id: 'testStore',
            fields: ['id', 'thumbnail', 'index'],
            pageSize: 10,
            data: fields
        });
        
        var _this = this;
        var defConfig = {
            store: store,
            tpl: [
                '<tpl for=".">',
                    '<div class="thumbnail">',
                        '<div class="thumbnail-inner">',
                            '<img src="{thumbnail}" alt="" />',
                            '<div class="thumbnail-rect" style="display: none;"></div>',
                        '</div>',
                    '</div>',
                '</tpl>',
            ],
            style: 'height: 100%', // For scrollbars to appear correctly.
            store: store,
            itemSelector: 'div.thumbnail',
            autoScroll: true,
            listeners: {
                itemclick: function(view, model)
                {
                    var index = model.get('index');
                    
                    _this.viewer.gotoPage(index);
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Fetch viewport.
        this.viewport = this.viewer.getViewport();
        
        // Watch for page changes.
        this.viewer.getEventDispatcher().bind('pagechange', this, this.onPageChange);
        
        // Watch for viewport changes.
        this.viewer.getViewportEventDispatcher().bind('change', this, this.onViewportChange);
        
        // Hide or show first rectangles at load of thumbnail.
        var _this = this;
        this.on('viewready',
            function()
            {
                setTimeout(function() { _this.onPageChange(); }, 100);
            });
    },
    
    onPageChange: function()
    {
        // Fetch some shortcuts.
        var pageNumber = this.viewer.getPage();
        var node       = this.getNode(pageNumber);
        var image      = $(node).find('img');
        
        // Set current rectangle.
        this.rectangle = $(node).find('.thumbnail-rect').get(0);
        
        // Get document dimensions.
        var documentDimensions = this.viewport.getDocument().getDimensions();
        
        // Get image dimensions.
        this.imageDimensions = {width: image.width() || 0, height: image.height() || 0};
        
        // Calculate factors.
        this.widthFactor  = this.imageDimensions.width  / documentDimensions.width;
        this.heightFactor = this.imageDimensions.height / documentDimensions.height;
        
        // Show just the current rectangle.
        for (var i = this.binding.getScanAmount() - 1; i >= 0; --i)
        {
            // Fetch rectangle.
            var node       = this.getNode(i);
            var rectangle  = $(node).find('.thumbnail-rect');
            
            // Show or hide it.
            if (i === pageNumber)
            {
                rectangle.show();
            }
            else
            {
                rectangle.hide();
            }
        }
        
        // Trigger viewport change.
        this.onViewportChange();
    },
    
    onViewportChange: function()
    {
        // Check for current timer and rectangle.
        if ((this.timer !== undefined) || (this.rectangle === undefined))
        {
            return;
        }
        
        // Set timer to avoid updating to many times.
        var _this = this;
        this.timer = setTimeout(
            function()
            {
                // Clear timer.
                _this.timer = undefined;
                
                // Fetch some shortcuts.
                var area = _this.viewport.getVisibleArea();
                
                // Calculate AABB of page inside thumbnail.
                var topLeft = {
                    x: Math.max(0, Math.min(_this.imageDimensions.width,  Math.round(area.topLeft.x * _this.widthFactor))),
                    y: Math.max(0, Math.min(_this.imageDimensions.height, Math.round(area.topLeft.y * _this.heightFactor)))
                };
                var bottomRight = {
                    x: Math.min(_this.imageDimensions.width,  Math.round(area.bottomRight.x * _this.widthFactor)),
                    y: Math.min(_this.imageDimensions.height, Math.round(area.bottomRight.y * _this.heightFactor))
                };
                
                // Set new rectanlge position and size.
                _this.rectangle.style.left   = topLeft.x + "px";
                _this.rectangle.style.top    = topLeft.y + "px";
                _this.rectangle.style.width  = (bottomRight.x - topLeft.x) + "px";
                _this.rectangle.style.height = (bottomRight.y - topLeft.y) + "px";
            },
            10
        );
    }
});

Ext.define('Ext.ux.NavigationPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.navigationpanel',

    initComponent: function()
    {
        var defConfig = {
            border: false,
            title: 'Navigation',
            items: [{
                xtype: 'thumbnailview',
                viewer: this.viewer
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
