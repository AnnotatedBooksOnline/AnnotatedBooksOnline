/*
 * Export form class.
 */

Ext.define('Ext.ux.ExportForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.exportform',
    
    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            items: [{
                xtype: 'radiogroup',
                fieldLabel: 'Page selection',
                columns: 1,
                vertical: true,
                labelAlign: 'top',
                items: [{
                    boxLabel: 'Export current scan',
                    name: 'page',
                    inputValue: 'scan',
                    checked: true
                },{ 
                    boxLabel: 'Export binding',
                    name: 'page',
                    inputValue: 'binding'
                },{
                    boxLabel: 'Export range of scans',
                    name: 'page',
                    inputValue: 'range'
                },{
                    xtype: 'fieldcontainer',
                    heigth: 100,
                    width: 300,
                    layout: 'hbox',
                    fieldLabel: 'Pages',
                    labelWidth: 50,
                    labelAlign: 'left',
                    style: 'margin-left: 20px',
                    disabled: true,
                    name: 'range',
                    items: [{
                        xtype: 'numberfield',
                        flex: 0,
                        width: 60,
                        name: 'pageFrom'
                    },{
                        xtype: 'label',
                        text: '-',
                        margins: '0 10 0 10'
                    },{
                        xtype: 'numberfield',
                        flex: 0,
                        width: 60,
                        name: 'pageTo'
                    }]
                }],
                listeners: {
                    change: function(field, newValue)
                    {
                        this.down('[name=range]').setDisabled(newValue.page != 'range');
                    }
                }
            },{
                xtype: 'radiogroup',
                fieldLabel: 'Annotations',
                columns: 1,
                vertical: true,
                labelAlign: 'top',
                items: [{
                    boxLabel: 'Without transcriptions',
                    name: 'transcriptions',
                    inputValue: 'off',
                    checked: true
                },{ 
                    boxLabel: 'With transcriptions',
                    name: 'transcriptions',
                    inputValue: 'on'
                },{
                    xtype: 'checkbox',
                    name: 'polygons',
                    style: 'margin-left: 20px;',
                    checked: false,
                    boxLabel: 'Display polygons on scan',
                    disabled: true
                }],
                listeners: {
                    change: function(field, newValue)
                    {
                        this.down('[name=polygons]').setDisabled(newValue.transcriptions != 'on');
                    }
                }
            },{
                xtype: 'button',
                text: 'Export',
                flex: 0,
                width: 100,
                maxWidth: 100,
                style: 'margin-top: 20px',
                handler: function()
                {
                    var form = this.up('form').getForm();
                    
                    if (form.isValid())
                    {
                        _this.exportPdf(form.getValues(false));
                    }
                }
            }],
            
            buttons: []
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    exportPdf: function(values)
    {
        // Set scan id.
        var viewer = this.up('viewerpanel');
        values.scanId = viewer.book.getScan(viewer.pageNumber).get('scanId');
        
        RequestManager.getInstance().request(
            'Pdf',
            'generate',
            values,
            this,
            function(data)
            {
                // Download just generated file.
                Ext.apply(data, {
                    controller: 'Pdf',
                    action: 'download'
                });
                console.log(data);
                window.location = '?' + Ext.Object.toQueryString(data);
            }
        );
    }
});

/*
 * Workspace panel class.
 */

Ext.define('Ext.ux.WorkspacePanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.workspacepanel',
    
    initComponent: function()
    {
        var defConfig = {
            title: 'Workspace',
            collapsible: true,
            collapsed: true,
            width: 300,
            minWidth: 300,
            items: [{
                xtype: 'annotationspanel',
                title: 'Annotations'
            },{
                title: 'Notes'
            },{
                title: 'Export',
                xtype: 'exportform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

