/*
 * Viewport panel interface class.
 */

Ext.define('Ext.ux.ViewportPanel', {
	extend: 'Ext.Panel',

	alias: 'widget.viewportpanel',

	requires: [],

	initComponent: function()
	{
		//NOTE: configuration of viewport
		
		var defConfig = {
			//TODO: add more default options, available via this.optionName
			plain: true,
			border: false
		};
		
		Ext.applyIf(this, defConfig);
		
		this.callParent();        
	},
    
	afterRender : function()
	{
		var size = this.ownerCt.getSize();
		
		this.viewport = new Viewport(this.body.dom, size.width, size.height, 151, 225, 5);
		
		this.callParent(); 
	},
	
	afterComponentLayout : function(width, height)
	{
		if (this.viewport !== undefined)
			this.viewport.setDimensions(width, height);
		
		this.callParent(arguments);
	},
	
	setSize : function(width, height, animate)
	{
		if (this.viewport !== undefined)
			this.viewport.setDimensions(width, height);
		
		this.callParent(arguments);
	}
});
