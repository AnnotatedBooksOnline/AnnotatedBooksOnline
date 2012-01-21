/*
 * Binding information panel class.
 */

Ext.define('Ext.ux.BindingInformationPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.bindinginformationpanel',
    
    initComponent: function()
    {
    	var viewer = this.viewer;
    	
        var defConfig = {
            border: false,
            title: 'Binding information',
            store: {
                fields: ['name', 'value'],
                data: [
                    {name: 'Author', value: 'Leonardo da Vinci'},
                    {name: 'Year',   value: '1497'}
                ]
            },
            bbar: {
                xtype: 'button',
                text: 'Modify binding',
                handler: function()
                {
                    Application.getInstance().gotoTab('upload', [viewer.binding], true);
                }
            },
            columns: [
                {header: 'Name',  dataIndex: 'name',  flex: 1},
                {header: 'Value', dataIndex: 'value', flex: 1}
            ]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        //TODO: set document
    }
});

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
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'bindinginformationpanel',
                //collapsed: false,
                collapsible: true,
                viewer: this.viewer,
                //height: 200,
                flex: 1
            },{
                xtype: 'navigationpanel',
                //collapsed: false,
                collapsible: true,
                viewer: this.viewer,
                //height: '60%'
                flex: 3
             },{
                xtype: 'referencespanel',
                title: 'References',
                collapsed: true,
                collapsible: true,
                viewer: this.viewer,
                //height: '20%'
                flex: 1
            }],
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
