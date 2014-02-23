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
            autoScroll: true,
            items: [{
                xtype: 'navigationpanel',
                autoScroll: true,
                viewer: this.viewer,
                flex: 5
             },{
                xtype: 'referencespanel',
                title: 'Link to this page',
                autoScroll: true,
                collapsed: false,
                collapsible: true,
                viewer: this.viewer
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

