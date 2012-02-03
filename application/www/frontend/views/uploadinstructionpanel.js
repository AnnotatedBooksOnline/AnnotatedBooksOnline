/*
 * Upload instruction panel class.
 */

Ext.define('Ext.ux.UploadInfo', {
    extend: 'Ext.form.Panel',
    alias: 'widget.uploadinstructionpanel',
    initComponent: function() 
    {        
        var _this = this;
        
        var defConfig = {
            bodyPadding: 10,
            cls: 'white-tab',
            frame: true,
            items: [{
                xtype: 'button',
                text: 'Continue',
                iconCls: 'accept-icon',
                width: 140,
                handler: function()
                {
                    Application.getInstance().gotoTab('upload',[],true);
                    this.up('uploadinstructionpanel').close();
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        RequestManager.getInstance().request('Setting', 'getSetting', {setting: 'upload-instructions'}, this,
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
                        html: textPage +
                        //remove this when the problem is solved
                        '<br/>Take care not to open or switch to another tab while uploading scans if you are not using Internet Explorer, for this may stop the uploading process.'
                    }
                };
                
                this.insert(this.items.length-1, [text]);
            }
        );
    }
});
