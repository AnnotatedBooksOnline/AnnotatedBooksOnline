/*
 * Navigation panel class.
 */

Ext.define('Ext.ux.ThumbnailView', {
    extend: 'Ext.view.View',
    alias: 'widget.thumbnailview',
    
    initComponent: function()
    {
        var fields = [];
        /*for (var i = 0; i < this.binding.getScans().length; i++)
        {
            var document = this.binding.getScans()[i];
            
            //fields[i] = ['tiles/' + document.scanId + '/tile_0_0_0.jpg',
            fields[i] = ['tiles/thumbnails/' + document.scanId + '.jpg',
                         i == 0 ? '<div id="test" style="position: absolute; border: 2px solid red;"></div>' : '',
                         i];
        }*/
        fields[0] = ['tiles/thumbnails/WRONG.jpg',
                         i == 0 ? '<div id="test" style="position: absolute; border: 2px solid red;"></div>' : '',
                         i];
        
        // TODO: Use page store.
        var store = Ext.create('Ext.data.ArrayStore', {
            id: 'testStore',
            fields: ['thumbnail', 'rect', 'page'],
            pageSize: 10,
            data: fields
        });
        
        var defConfig = {
            store: store,
            tpl: [
                '<tpl for=".">',
                    '<div class="thumbnail" style="cursor: pointer; float: left; margin: 10px;">',
                        '<div style="position: relative;">',
                            '<img src="{thumbnail}" />',
                            '{rect}',
                        '</div>',
                    '</div>',
                '</tpl>',
            ],
            style: 'height: 100%', // For scrollbars to appear correctly.
            store: store, //this.getStore(),
            itemSelector: 'div.thumbnail',
            autoScroll: true,
            listeners: {
                itemclick: function(view, record)
                {
                    var page = record.get('page');
                    
                    this.up('navigationpanel').gotoPage(page);
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    changeIndex: function(oldPage, newPage)
    {
        // TODO: Re-implement and improve.
        
        /*
        if (this.timer === undefined)
        {
            var _this = this;
            this.timer = setTimeout(
                function()
                {
                    _this.timer = undefined;
                    
                    var area = _this.viewport.getVisibleArea();
                    
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
        */
        
        /*
        this.getStore().getAt(oldPage).set('rect', '');
        this.getStore().getAt(newPage).set('rect', '<div id="test" style="position: absolute; border: 2px solid red;"></div>');
        var top = this.getEl().dom.childNodes[newPage].offsetTop;
        top -= this.getEl().dom.childNodes[0].offsetTop;
        this.getEl().scrollTo('top', top, true);
        */
    }//,
    
    /*
    // NOTE: Name seems to be internally used!
    getStore: function(data)
    {
        var store = Ext.create('Ext.ux.StoreBase', {
            model: 'Ext.ux.PageModel',
            //data: data.columns
        });
        
        return store;
    }
    */
});

Ext.define('Ext.ux.NavigationPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.navigationpanel',

    initComponent: function()
    {
        var defConfig = {
            title: 'Navigation',
            items: [{
                xtype: 'thumbnailview',
                book: this.book
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        if (this.book !== undefined)
        {
            this.setBook(this.book);
        }
    },
    
    setBook: function(book)
    {
        //TODO: set book & document
    },
    
    gotoPage: function(number)
    {
        this.up('viewerpanel').gotoPage(number);
    },
    
    setPage: function(number)
    {
        this.down('thumbnailview').changeIndex(this.currentPage(), number);
    },
    
    currentPage: function()
    {
        return this.up('viewerpanel').getPage();
    }
});
