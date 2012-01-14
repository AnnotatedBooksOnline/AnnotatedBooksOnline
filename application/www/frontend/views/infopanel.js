/*
 * Info panel class.
 */

Ext.define('Ext.ux.Info', {
    extend: 'Ext.Panel',
    alias: 'widget.infopanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            bodyPadding: 10
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        RequestManager.getInstance().request('Main', 'textPage', {textPage: 'info-page'}, this,
            function(textPage)
            {
                var text = {
                    xtype: 'container',
                    items: {
                        xtype: 'panel',
                        border: false,
                        flex: 1,
                        width: 500,
                        cls: 'plaintext',
                        html: textPage
                    }
                };
                
                this.insert(this.items.length, [text]);
            },
            function()
            {
                alert('Something went wrong. Please try again.');
            }
        );
    }
});

