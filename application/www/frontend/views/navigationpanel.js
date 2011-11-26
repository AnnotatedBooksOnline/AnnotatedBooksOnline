/*
 * Navigation panel class.
 */

Ext.define('Ext.ux.ThumbnailView', {
    extend: 'Ext.view.View',
    alias: 'widget.thumbnailview',
    
    initComponent: function()
    {
        var fields = [];
        for (var i = 0; i < this.book.getScanAmount(); i++)
        {
            var document = this.book.getScans()[i];
            
            //fields[i] = ['tiles/' + document.bookId + '/' + document.scanId + '/tile_0_0_0.jpg',
            fields[i] = ['tiles/tile_0_0_0.jpg',
                         i == 0 ? '<div id="test" style="position: absolute; border: 2px solid red;"></div>' : ''];
        }
        
        // TODO: Use page store.
        var store = Ext.create('Ext.data.ArrayStore', {
            id: 'testStore',
            fields: ['thumbnail', 'rect'],
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
            store: store, //this.getStore(),
            itemSelector: 'div.thumbnail',
            autoScroll: true,
            listeners: {
                itemclick: function(view, record)
                {
                    
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    /*
    // NOTE: Name seems to be internally used!
    getStore: function(data)
    {
        var store = Ext.create('Ext.data.Store', {
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
            //layout: 'accordion',
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
    
    gotoPageNumber: function(number)
    {
        ;
    }
});
