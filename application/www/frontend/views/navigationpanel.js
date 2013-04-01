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
            
            fields[i] = [
                scan.get('scanId'),
                i,
                scan.get('page'),
                165,
                Math.floor(scan.get('height') * 165 / scan.get('width')),
                scan.get('location'),
                escape(scan.get('scanName'))
            ];
        }
        
        // Create store.
        var store = Ext.create('Ext.data.ArrayStore', {
            name: 'thumbnailStore',
            fields: ['id', 'index', 'page', 'width', 'height', 'location', 'scanName'],
            pageSize: 10,
            data: fields
        });
        
        var _this = this;
        var defConfig = {
            store: store,
            tpl: [
                '<tpl for=".">',
                    '<div class="thumbnail" style="clear: both">',
                        '<div class="thumbnail-inner" style="width: {width}px; height: {height}px; visibility: hidden">',
                            '<img src="" alt="" title="{scanName}" width="{width}" height="{height}"/>',
                            '<div class="thumbnail-rect" style="display: none;" title="{scanName}"></div>',
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
                setTimeout(function()
                {
                    _this.onPageChange();
                }, 100);
            });
        
        this.getEl().addListener("scroll", function()
        {
            this.onScroll();
        }, this);
    },
    
    onScroll: function()
    {
        if (this.scrollTimer !== undefined)
        {
            return;
        }
        
        var _this = this;
        
        this.scrollTimer = setTimeout(function()
        {
            _this.scrollTimer = undefined;

            // Initialize lazy thumbnail loading data.
            if (_this.visibleScans === undefined)
            {
                _this.visibleScans = [];
                _this.nodes = _this.getNodes();
                var records = _this.getStore().getRange();
                
                if (_this.nodes.length > 0)
                {
                    var nodeElems = $(_this.nodes[0]).parent().children('.thumbnail');
                    _this.nodes[0] = {
                        el: nodeElems.get(0),
                        top: nodeElems.get(0).offsetTop,
                        bottom: nodeElems.get(0).offsetTop + records[0].get('height'),
                        id: records[0].get('id'),
                        location: records[0].get('location')
                    };
                    
                    var node0 = $(_this.nodes[0].el);
                    var margin = node0.outerHeight(true) - node0.outerHeight();
                    var top = _this.nodes[0].bottom;
                    for (var i = 1; i < _this.nodes.length; i++)
                    {
                        var height = records[i].get('height');
                        top += margin;
                        _this.nodes[i] = {
                            el: nodeElems.get(i),
                            top: top,
                            bottom: top + height,
                            id: records[i].get('id'),
                            location: records[i].get('location')
                        };
                        top += height;
                    }
                }
            }
            
            // Update visible thumbnails.
            if (_this.nodes.length > 0)
            {   
                var oldVisible = _this.visibleScans;
                _this.visibleScans = [];
                
                var top = _this.getEl().getScroll().top;
                var bottom = top + _this.getSize(true).height;
                
                var inRange = function(node)
                {
                    return node.top < bottom + 300 && node.bottom > top - 300;
                };
                
                // Find thumbnails to be displayed.
                for (var i = 0; i < _this.nodes.length; i++)
                {
                    var node = _this.nodes[i];
                    if (inRange(node))
                    {
                        _this.visibleScans.push(node);
                    }
                }
                
                // Add newly visible thumbnails.
                for (var i = 0; i < _this.visibleScans.length; i++)
                {
                    var node = _this.visibleScans[i];
                    var el = node.el.firstChild;
                    if (el.style.visibility != 'visible')
                    {
                        el.firstChild.src = 'data/tiles/' + node.location + node.id + '/tile_0_0_0.jpg';
                        el.style.visibility = 'visible';
                    }
                }
                
                // Remove invisible thumbnails.
                for (var i = 0; i < oldVisible.length; i++)
                {
                    var node = oldVisible[i];
                    var el = node.el.firstChild;
                    if (!inRange(node))
                    {
                        el.style.visibility = 'hidden';
                        el.firstChild.src = 'about:blank';
                    }
                }
            }
        }, 200);
    },
    
    onPageChange: function()
    {
        // Fetch some shortcuts.
        var pageNumber = this.viewer.getPage();
        var node       = this.getNode(pageNumber);
        var container  = $(node).find('.thumbnail-inner');
        
        // Set current rectangle.
        this.rectangle = $(node).find('.thumbnail-rect').get(0);
        
        // Get document dimensions.
        var documentDimensions = this.viewport.getDocument().getDimensions();
        
        // Get image dimensions.
        this.imageDimensions = {width: container.width() || 0, height: container.height() || 0};
        
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
        
        var center = (this.getHeight() - container.get(0).offsetHeight) / 2;
        this.getEl().scrollTo('top', Math.max(0, container.get(0).offsetTop - center), true);
        
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
                
                _this.onScroll();
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
        var _this = this;
        
        var defConfig = {
            border: false,
            title: 'Navigation',
            items: [{
                xtype: 'thumbnailview',
                viewer: this.viewer
            }],
            listeners: {
                expand: function()
                {
                    // Fix layout
                    _this.ownerCt.doLayout();
                    _this.getComponent(0).onScroll();
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

