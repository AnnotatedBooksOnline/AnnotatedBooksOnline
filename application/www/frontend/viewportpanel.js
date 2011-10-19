/*
 * Viewport panel interface class.
 */

Ext.define('Ext.ux.ViewportPanel', {
	extend: 'Ext.Panel',

	alias: 'widget.viewportpanel',

	requires: ['Ext.slider.Single'],

	initComponent: function()
	{
		//NOTE: configuration of viewport
		
		//TODO: make this a whole component, including sidepanels
		
		var _this = this;
		var defConfig = {
			//TODO: add more default options, available via this.optionName
			
			plain: true,
			border: false,
			layout: 'absolute',
			items: [{
				plain: true,
				border: false,
				x: 0,
				y: 0,
				width: '100%',
				height: '100%'
			},{
				xtype: 'slider',
				hideLabel: true,
				useTips: false,
				x: 20,
				y: 20,
				height: 214,
				vertical: true,
				minValue: 0,
				maxValue: 200,
				listeners: {
					change: function(slider, value) {
						_this.viewport.zoom(value / 200 * 5);
					}
				}
			}]
		};
		
		Ext.apply(this, defConfig);
		
		this.callParent();        
	},
	
	afterRender: function()
	{
		this.callParent();
		
		this.slider = this.items.last();
	},
	
	afterComponentLayout: function(width, height)
	{
		if (this.viewport === undefined)
		{
			var dom = this.items.first().body.dom;
			
			this.viewport = new Viewport(dom, width, height, 151, 225, 5);
			
			this.eventDispatcher = this.viewport.getEventDispatcher();
			this.eventDispatcher.bind('change', this.afterViewportChange, this);
		}
		else
		{
			this.viewport.setDimensions(width, height);
		}
		
		this.callParent(arguments);
	},
	
	afterViewportChange: function(event, position, zoomLevel, rotation, area)
	{
		this.slider.setValue(Math.round(zoomLevel / 5 * 200)); //TODO: get via viewport method
	},
	
	setSize: function(width, height, animate)
	{
		if (this.viewport !== undefined)
			this.viewport.setDimensions(width, height);
		
		this.callParent(arguments);
	}
});
