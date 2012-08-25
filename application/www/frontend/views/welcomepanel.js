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
        
        var text = {
                xtype: 'container',
                items: {
                    xtype: 'panel',    
                    border: false,
                    flex: 1,
                    width: 750,
                    cls: 'plaintext',
                    html: getCachedSetting('welcome-page')
                }
            };
            
        this.insert(this.items.length, [text]);
    }
});
