/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.RestorePassword', {
    extend: 'Ext.Panel',
    alias: 'widget.restorepasswordpanel',
    
    initComponent: function() 
    {    	    	
    	var config = 
    	{
                bodyPadding: 10,
                items: [{
                    xtype: 'container',
                    width: 500,
                    style: 'margin-bottom: 20px;',
                    layout: {
                        type: 'hbox',
                        pack: 'center'
                    },
                    defaults: {
                        style: 'margin-right: 5px;'
                    },
                    items: []
                	},
                ]
        };
    	
    	// Send request with token from URL.
    	var token = this.tabInfo.data[0];
    	var _this = this;
    	//TODO ...
        
    	Ext.apply(_this, config);
    	this.callParent();
    }
});
