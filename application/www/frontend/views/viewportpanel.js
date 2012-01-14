/*
 * Viewport panel class.
 */

Ext.define('Ext.ux.ViewportPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.viewportpanel',

    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            plain: true,
            border: false
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        var size = this.getSize();
        this.viewport = new Viewport(size.width, size.height, this.document);
    },
    
    afterComponentLayout: function(width, height)
    {
        this.viewport.setDimensions(width, height);
        
        if (this.insertedViewport === undefined)
        {
            this.viewport.reset();
            this.viewport.insert(this.body.dom);
            
            this.insertedViewport = true;
        }
        
        this.callParent(arguments);
    },
    
    setSize: function(width, height, animate)
    {
        this.viewport.setDimensions(width, height);
        
        this.callParent(arguments);
    },
    
    getViewport: function()
    {
        return this.viewport;
    },
    
    setDocument: function(document)
    {
        this.viewport.setDocument(document);
    },
    
    getDocument: function()
    {
        return this.viewport.getDocument();
    }
});
