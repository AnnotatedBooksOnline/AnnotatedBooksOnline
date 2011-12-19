/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Activation', {
    extend: 'Ext.Panel',
    alias: 'widget.activationpanel',
    
    initComponent: function() 
    {    	
    	// TODO ........
    	
    	var successConfig = 
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
	                {
	                    xtype: 'container',
	                    items: {
	                        style: 'text-align: justify;',
	                        xtype: 'panel',
	                        border: false,
	                        width: 500,
	                        flex: 0,
	                        html: '<b>Yay!</b>'
	                    }
	                }
                ]
        };
    	
    	var failConfig = 
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
	                {
	                    xtype: 'container',
	                    items: {
	                        style: 'text-align: justify;',
	                        xtype: 'panel',
	                        border: false,
	                        width: 500,
	                        flex: 0,
	                        html: '<b>Nay!</b>'
	                    }
	                }
                ]
        };
    	
    	// Send request with activation token from URL.
    	var token = this.tabInfo.data[0];
    	var _this = this;
    	RequestManager.getInstance().request(
            'UserActivation',
            'activateUser',
            {token: token},
            _this,
            function(success)
            {
                if (success)
                {
                	Ext.apply(_this, successConfig);
                }
                else
                {
                	Ext.apply(_this, failConfig);
                }
            },
            function(data)
            {
            	Ext.apply(_this, failConfig);
            }
        );
        
    	this.callParent();
    }
});
