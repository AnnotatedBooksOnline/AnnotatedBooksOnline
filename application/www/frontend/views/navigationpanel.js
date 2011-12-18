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
            
            //fields[i] = ['tiles/' + document.scanId + '/tile_0_0_0.jpg',
            fields[i] = ['tiles/tile_0_0_0.jpg',
                         i == 0 ? '<div id="test" style="position: absolute; border: 2px solid red;"></div>' : '',
                         i];
        }
        
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
                    this.up('navigationpanel').gotoPageNumber(page);
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    changeIndex: function(oldPage, newPage)
    {
        this.getStore().getAt(oldPage).set('rect', '');
        this.getStore().getAt(newPage).set('rect', '<div id="test" style="position: absolute; border: 2px solid red;"></div>');
        var top = this.getEl().dom.childNodes[newPage].offsetTop;
        top -= this.getEl().dom.childNodes[0].offsetTop;
        this.getEl().scrollTo('top', top, true);
    }//,
    
    /*
    // NOTE: Name seems to be internally used!
    getStore: function(data)
    {
        var store = Ext.create('Ext.ux.Store', {
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
    
    gotoPageNumber: function(number)
    {
        this.up('viewerpanel').setPage(number);
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
