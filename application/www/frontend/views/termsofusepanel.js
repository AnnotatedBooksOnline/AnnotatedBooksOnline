/*
 * Terms of use panel class.
 */

Ext.define('Ext.ux.TermsOfUse', {
    extend: 'Ext.Panel',
    alias: 'widget.termsofusepanel',
    
    initComponent: function() 
    {        
        var _this = this;
        
        var defConfig = {
            bodyPadding: 10
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        RequestManager.getInstance().request('Main', 'textPage', {textPage: 'terms-of-use'}, this,
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
