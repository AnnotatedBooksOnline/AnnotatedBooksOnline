/*
 * Viewer panel interface class.
 */

Ext.define('Ext.ux.Viewer', {
    extend: 'Ext.Panel',

    alias: 'widget.viewerpanel',

    requires: [], //TODO: tabs, border layout

    initComponent: function()
    {
        //NOTE: configuration of viewport
        
        //TODO: make this a whole component, including sidepanels
        
        var westRegion = {
            region: 'west',
            title: 'Navigation',
            collapsible: true,
            split: true,
            width: 200,
            html:
                '<div style="position: relative; float: left; top: 10px; left: 10px;">' +
                '<img src="tiles/tile_0_0_0.jpg" />' +
                '<div id="test" style="position: absolute; border: 2px solid red;">' +
                '</div></div>' +
                '<div style="position: relative; float: left; top: 10px; left: 10px;">' +
                '<img src="tiles/tile_0_0_0.jpg" />' +
                '<div id="test2" style="position: absolute; border: 2px solid red;">' +
                '</div></div>'
        };
        
        var centerRegion = {
            region: 'center',
            xtype: 'tabpanel',
            activeTab: 0,
            plain: true,
            defaults: {
                closable: true
            },
            items: [{
                title: 'Book 1',
                xtype: 'viewportpanel'
            },{
                title: 'Book 2',
                xtype: 'viewportpanel'
            },{
                title: 'Book 3',
                xtype: 'viewportpanel'
            },{
                title: 'Book 4',
                xtype: 'viewportpanel'
            }]
            /*,
            listeners: {
                tabchange: onTabChange,
                afterrender: onAfterRender 
            }
            */
        };
        
        var eastRegion = {
            region: 'east',
            title: 'Book information',
            xtype: 'informationpanel',
            collapsible: true,
            collapsed: true,
            width: 200
        };
        
        var defConfig = {
            //TODO: add more default options, available via this.optionName
            
            layout: {
                type: 'border',
                padding: 5
            },
            items: [westRegion, centerRegion, eastRegion]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();        
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.tabs = this.items.get(1);
    },
    
    afterComponentLayout: function(width, height)
    {
        this.callParent(arguments);
        
        var tab = this.tabs.items.get(0); //TODO: get current tab
        var viewport = tab.getViewport();
        
        var eventDispatcher = viewport.getEventDispatcher();
        eventDispatcher.bind('change', this.afterViewportChange, this);
        
        //TODO: set current area
        this.afterViewportChange(undefined, undefined, undefined, undefined, viewport.getVisibleArea());
    },
    
    afterViewportChange: function(event, position, zoomLevel, rotation, area)
    {
        if (this.skipNextChangeEvent === true)
        {
            this.skipNextChangeEvent = false;
            return;
        }
        
        if (this.timer == undefined)
        {
            var _this = this;
            this.timer = setTimeout(
                function()
                {
                    _this.timer = undefined;
                    
                    var topLeft = {
                        x: Math.max(0, Math.min(151, Math.round(area.topLeft.x))),
                        y: Math.max(0, Math.min(225, Math.round(area.topLeft.y)))
                    };
                    var bottomRight = {
                        x: Math.min(151, Math.round(area.bottomRight.x)),
                        y: Math.min(225, Math.round(area.bottomRight.y))
                    };
                    
                    var test = document.getElementById("test");
                    
                    test.style.left   = topLeft.x + "px";
                    test.style.top    = topLeft.y + "px";
                    test.style.width  = (bottomRight.x - topLeft.x) + "px";
                    test.style.height = (bottomRight.y - topLeft.y) + "px";
                },
                10
            );
        }
    },
    
    setSize: function(width, height, animate)
    {
        this.callParent(arguments);
    }
});
