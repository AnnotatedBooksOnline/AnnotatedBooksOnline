/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Welcome', {
    extend: 'Ext.Panel',
    alias: 'widget.welcomepanel',
    
    initComponent: function() 
    {        
        var _this = this;
        
        var defConfig = {
            bodyPadding: 10,
            cls: 'white-tab',
            frame: true
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        RequestManager.getInstance().request('Setting', 'getSetting', {setting: 'welcome-page'}, this,
            function(textPage)
            {
                var text = {
                    xtype: 'container',
                    items: {
                        xtype: 'panel',
                        border: false,
                        flex: 1,
                        width: 750,
                        cls: 'plaintext',
                        html: textPage
                    }
                };
                
                this.insert(this.items.length, [text]);
            }
        );
    }
});
