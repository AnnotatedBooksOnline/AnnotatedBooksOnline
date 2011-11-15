/*
 * Navigation panel class.
 */

Ext.define('Ext.ux.ThumbnailView', {
    extend: 'Ext.view.View',
    alias: 'widget.thumbnailview',
    
    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<div class="thumbnail" style="">',
                        //'<div style="float: left; width: 50px; height: 67px; margin-right: 10px;">',
                        //    '<img src="{thumbnail}" style="width: 50px; height: 67px;"/>',
                        //'</div>',
                        //'<div style="float: left; margin-top: 10px;">',
                        //    '<table>{properties}</table>',
                        //'</div>',
                        //'<div style="clear: both;"></div>',
                    '</div>',
                '</tpl>',
            ],
            store: this.getStore(),
            itemSelector: 'div.thumbnail',
            
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    getStore: function(data)
    {
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.PageModel',
            //data: data.columns
        });
        
        return store;
    },
});

Ext.define('Ext.ux.NavigationPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.navigationpanel',
    requires: [], //TODO: sepcify

    initComponent: function()
    {
        var defConfig = {
            title: 'Navigation',
            //layout: 'accordion',
            //items: [{
            //    title: 'Pages',
            //    xtype: 'thumbnailview'
            //}],
            //*
            html:
                '<div style="position: relative; float: left; top: 10px; left: 10px;">' +
                '<img src="tiles/tile_0_0_0.jpg" />' +
                '<div id="test" style="position: absolute; border: 2px solid red;">' +
                '</div></div>'// +
                //'<div style="position: relative; float: left; top: 10px; left: 10px;">' +
                //'<img src="tiles/tile_0_0_0.jpg" />' +
                //'<div id="test2" style="position: absolute; border: 2px solid red;">' +
                //'</div></div>'//*/
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
