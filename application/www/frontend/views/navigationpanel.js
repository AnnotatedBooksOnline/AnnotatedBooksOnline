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
                	'<div class="thumbnail" style="cursor: pointer;">',
                		'<div style="position: relative; float: left; top: 10px; left: 10px;">',
                			'<img src="{thumbnail}" />',
                			'{rect}',
                		'</div>',
                	'</div>',
                '</tpl>',
            ],
            itemSelector: 'div.thumbnail',
            listeners: {
                itemclick: function(view, record)
                {
                	
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    

});


Ext.define('Ext.ux.NavigationPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.navigationpanel',
    requires: [], //TODO: sepcify

    initComponent: function()
    {	
    	var fields = [];
        for (var i = 0; i < this.book.getDocumentAmount(); i++)
        {
        	var document = this.book.getDocuments()[i];
        	fields[i] = ['tiles/' + document.bookId + '/' + document.scanId + '/tile_0_0_0.jpg', 
        	             i == 0 ? '<div id="test" style="position: absolute; border: 2px solid red;"></div>' : ''];
        }
        
        var defConfig = {
            title: 'Navigation',
            //layout: 'accordion',
            items: [{
            		xtype: 'thumbnailview',
            		store: Ext.create('Ext.data.ArrayStore', {
                		id:'testStore',
                    	fields:['thumbnail', 'rect'],
                    	pageSize:10,
                    	data:fields
                    })

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
