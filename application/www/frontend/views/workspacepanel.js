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
                        name: 'pageFrom',
                        minValue: 1,
                        allowBlank: false,
                        listeners: {
                            change: function(field, newvalue)
                            {
                                var other = this.ownerCt.getComponent(2).getValue();
                                var max = _this.up('viewerpanel').getPageAmount();
                                if (newvalue > max)
                                {
                                    this.setValue(max);
                                }
                                if (newvalue > other)
                                {
                                    this.ownerCt.getComponent(2).setValue(Math.min(max, newvalue));
                                }
                                if (!this.isValid())
                                {
                                    this.setValue(1);
                                }
                            }
                        },
                        value: 1
                    },{
                        xtype: 'label',
                        text: '-',
                        margins: '0 10 0 10'
                    },{
                        xtype: 'numberfield',
                        flex: 0,
                        width: 60,
                        name: 'pageTo',
                        minValue: 1,
                        allowBlank: false,
                        listeners: {
                            change: function(field, newvalue)
                            {
                                var other = this.ownerCt.getComponent(0).getValue();
                                var max = _this.up('viewerpanel').getPageAmount();
                                if (newvalue < other)
                                {
                                    this.ownerCt.getComponent(0).setValue(newvalue)
                                }
                                if (newvalue > max)
                                {
                                    this.setValue(max);
                                }
                                if (!this.isValid())
                                {
                                    this.setValue(1);
                                }
                            }
                        },
                        value: 1
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
            
            buttons: [],
            selectFirstField: false
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    exportPdf: function(values)
    {
        var _this = this;
        
        var sendRequest = function()
        {
            _this.setLoading('Exporting...');
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
                    window.location = '?' + Ext.Object.toQueryString(data);
                    _this.setLoading(false);
                },
                function()
                {
                    _this.setLoading(false);
                    return true;
                }
            );
        };
        
        var viewer = this.up('viewerpanel');
        values.scanId = viewer.getScanId();
        
        var pages = 1;
        if (values.page == 'binding')
        {
            pages = viewer.getPageAmount();
        }
        else if (values.page == 'range')
        {
            pages = values.pageTo - values.pageFrom + 1;
        }
        var time = Math.ceil(pages / 20);
        var size = Math.floor(0.4 + 1.2 * pages); // TODO: Make a bit better estimation.
        
        if (time > 10 || size > 15)
        {
            var seconds = time % 60;
            var minutes = Math.floor(time / 60) % 60;
            var hours = Math.floor(time / 3600);
            var timestr = '';
            if (hours > 0) { timestr += hours + 'h '; }
            if (minutes > 0) { timestr += minutes + 'm '; }
            if (seconds > 0) { timestr += seconds + 's '; }
            var info = '<p>You are about to export ' + pages + ' scans. '
                     + 'This may take some time and the resulting file may be large.</p>'
                     + '<p>Estimated processing time: ' + timestr + '<br/>'
                     + 'Estimated file size: ' + size + ' MB</p>';
            var confirm = new Ext.ux.ExportConfirmWindow({
                info: info,
                onContinue: function()
                {
                    sendRequest();
                    this.close();
                },
                onCancel: function()
                {
                    this.close();
                }
            });
            confirm.show();
        }
        else
        {
            sendRequest();
        }
    }
});

Ext.define('Ext.ux.ExportConfirmForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.exportconfirmform',

    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            layout: 'fit',
            items: [{
                xtype: 'panel',
                html: this.info,
                cls: 'plaintext',
                border: false
            }],
            
            buttons: [{
                text: 'Cancel',
                handler: function()
                {
                    _this.ownerCt.onCancel();
                }
            },{
                text: 'Continue',
                handler: function()
                {
                    _this.ownerCt.onContinue();
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.ExportConfirmWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Exporting',
            layout: 'fit',
            width: 400,
            height: 200,
            items: [{
                xtype: 'exportconfirmform',
                info: this.info
            }]
        };
        Ext.apply(this, defConfig);
        
        this.callParent();
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
            layout: 'fit',
            border: false,
            items: [{
                xtype: 'annotationspanel',
                title: 'Annotations',
                viewer: this.viewer
            },{
                title: 'Export',
                xtype: 'exportform',
                viewer: this.viewer
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
        
        if (Authentication.getInstance().isLoggedOn())
        {
            this.onLoggedOn();
        }
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
    },
    
    onLoggedOn: function()
    {
        this.insert(1, {
            title: 'Notes',
            xtype: 'notespanel',
            viewer: this.viewer,
            hidden: !Authentication.getInstance().hasPermissionTo('manage-notebook')
        });
    },
    
    onLoggedOut: function()
    {
        this.remove(1);
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.onLoggedOn();
        }
        else
        {
           this.onLoggedOut();
        }
    }
});
