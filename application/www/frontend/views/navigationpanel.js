/*
 * Navigation panel class.
 */

Ext.define('Ext.ux.NavigationPanel', {
    extend: 'Ext.Panel',
    alias : 'widget.navigationpanel',
    requires: [], //TODO: sepcify

    initComponent: function()
    {
        var defConfig = {
            title: 'Navigation',
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
