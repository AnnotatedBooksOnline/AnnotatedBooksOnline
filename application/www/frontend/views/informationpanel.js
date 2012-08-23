/*
 * Information panel class.
 */

Ext.define('Ext.ux.InformationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.informationpanel',
    
    initComponent: function()
    {
        var defConfig = {
            border: false,
            name: 'informationpanel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                collapsible: true,
                collapsed: true
            },
            autoScroll: true,
            items: [{
                xtype: 'bindinginformationpanel',
                title: 'Binding details',
                viewer: this.viewer,
                minHeight: 200,
                flex: 1
            },{
                xtype: 'navigationpanel',
                collapsible: true,
                collapsed: false,
                autoScroll: true,
                viewer: this.viewer,
                flex: 3
             },{
                xtype: 'referencespanel',
                title: 'Link to this page',
                autoScroll: true,
                viewer: this.viewer,
                flex: 1
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
