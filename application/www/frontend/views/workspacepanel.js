/*
 * Binding administration form class.
 */
Ext.define('Ext.ux.BindingAdminPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.bindingadminpanel',
    
    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            border: false,
            layout: {
                type: 'table',
                columns: 2
            },
            defaults: {
                bodyPadding: 5,
                style: 'margin-right: 5px'
            },
            items: [{
                xtype: 'panel',
                border: false,
                name: 'modifybindingtext',
                html: 'Modify binding information, such as title and author'
            },{
                xtype: 'button',
                text: 'General info',
                name: 'modifybindingbutton',
                width: 110,
                iconCls: 'binding-edit-icon',
                handler: function()
                {
                    Ext.create('Ext.window.Window', {
                        title: 'Modify binding',
                        modal: true,
                        constrain: true,
                        closable: false,
                        layout: 'fit',
                        items: {
                            xtype: 'bindingedit',
                            border: false,
                            bindingId: _this.getCurrentBindingModel().get('bindingId'),
                            onCancel: function()
                            {
                                this.up('window').close();
                            },
                            afterSubmit: function()
                            {
                                this.up('window').close();
                                _this.up('viewerpanel').reload();
                            }
                        }
                    }).show();
                }
            },{
                xtype: 'panel',
                border: false,
                name: 'modifyscanstext',
                html: 'Add or remove scans and books, change the page order.'
            },{
                xtype: 'button',
                text: 'Scans &amp; books',
                name: 'modifyscansbutton',
                width: 110,
                iconCls: 'scan-modify-icon',
                handler: function()
                {
                    Application.getInstance().gotoTab(
                        'upload', 
                        [_this.getCurrentBindingModel().get('bindingId')], 
                        true);
                    this.up('viewerpanel').close();
                }
            },{
                xtype: 'panel',
                border: false,
                name: 'annotationrevisions',
                html: 'View previous versions of annotations or restore them.'
            },{
                xtype: 'button',
                text: 'Revisions',
                name: 'annotationrevisionsbutton',
                width: 110,
                iconCls: 'revise-annotations-icon',
                handler: function()
                {
                     if (this.up('workspacepanel').down('annotationspanel').annotationsAreDirty())
                     {
                        var changeInfo = this.up('workspacepanel').down('annotationspanel').getChangeInfo();
                        Ext.Msg.alert('Unsaved changes', 'You have unsaved annotation changes ('
                            + changeInfo + '). Please save or revert your changes before '
                            + 'restoring older revisions.');
                        return;
                     }
                     
                     var scanId = this.up('viewerpanel').getScanId();
                    
                     var _this = this;
                    
                     var window = Ext.create('Ext.window.Window', {
                        title: 'Revisions',
                        modal: true,
                        constrain: true,
                        closable: true,
                        autoScroll: true,
                        width: 800,
                        height: 600,
                        layout: 'border',
                        items: [{
                            xtype: 'label',
                            region: 'north',
                            border: 3,
                            padding: 3,
                            margin: 5,
                            layout:{ align: 'middle' },
                            text: 'Double-click a revision in order to restore it.'
                        },{
                            region: 'center',
                            xtype: 'revisionspanel',
                            border: false,
                            scanId: scanId
                        }],
                        listeners: {
                            close: function()
                            {
                                // Reload the page on close.
                                var ann = _this.up('workspacepanel').down('annotationspanel');
                                ann.reloadAnnotations();
                            }
                        }
                    }).show();
                }
            },{
                xtype: 'panel',
                border: false,
                name: 'deletebindingtext',
                html: 'Delete this entire binding; use with care.',
                style: 'margin-top: 50px'
            },{
                xtype: 'button',
                text: 'Delete binding',
                name: 'deletebindingbutton',
                width: 110,
                iconCls: 'remove-icon',
                style: 'margin-top: 50px',
                handler: function()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Deletes the binding afterwards.
                    Ext.Msg.show({
                        title: 'Deleting binding',
                        msg: 'You are about to delete this binding. <b>This cannot be undone.</b><br/>Are you sure you want to proceed?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                        {
                            if (button == 'yes')
                            {
                                // Delete the binding.
                                RequestManager.getInstance().request(
                                    'Binding',
                                    'delete',
                                    {bindingId: _this.getCurrentBindingModel().get('bindingId')},
                                    _this,
                                    function()
                                    {
                                        Application.getInstance().viewport.closeTab();
                                    }
                                );
                            }
                        }
                    });  
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    showDelete: function(enabled)
    {
        this.down("[name=deletebindingbutton]").setVisible(enabled);
        this.down("[name=deletebindingtext]").setVisible(enabled);
    },
    
    showModify: function(enabled)
    {
        this.down("[name=modifybindingbutton]").setVisible(enabled);
        this.down("[name=modifybindingtext]").setVisible(enabled);
        this.down("[name=modifyscansbutton]").setVisible(enabled);
        this.down("[name=modifyscanstext]").setVisible(enabled);
    },
    
    getCurrentBindingModel: function()
    {
        return this.viewer.getBinding().getModel();
    }
});

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
                    boxLabel: 'Export current page',
                    name: 'page',
                    inputValue: 'scan',
                    checked: true
                },{ 
                    boxLabel: 'Export all pages',
                    name: 'page',
                    inputValue: 'binding'
                },{
                    boxLabel: 'Export range of pages',
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
                    boxLabel: 'Without annotations',
                    name: 'transcriptions',
                    inputValue: 'off',
                    checked: true
                },{ 
                    boxLabel: 'With annotations',
                    name: 'transcriptions',
                    inputValue: 'on'
                },{
                    xtype: 'panel',
                    border: false,
                    name: 'transcriptionoptions',
                    style: 'margin-left: 20px;',
                    items: [{
                        xtype: 'combobox',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['lang', 'text'],
                            data: [{
                                lang: 'all',
                                text: 'All fields'
                            }]
                        }),
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'lang',
                        forceSelection: true,
                        editable: false,
                        fieldLabel: 'Language',
                        disabled: true,
                        hidden: true, // TODO: make visible again, enabling a real choice.
                        name: 'language',
                        listeners: {
                            afterrender: function()
                            {
                                this.select('all');
                            }
                        }
                    },{
                        xtype: 'checkbox',
                        name: 'polygons',
                        checked: true,
                        boxLabel: 'Show annotations on scan',
                        disabled: true
                    }]
                }],
                listeners: {
                    change: function(field, newValue)
                    {
                        this.down('[name=polygons]').setDisabled(newValue.transcriptions != 'on');
                        this.down('[name=language]').setDisabled(newValue.transcriptions != 'on');
                    }
                }
            },{
                xtype: 'button',
                text: 'Export',
                iconCls: 'save-icon',
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
        
        var sendRequest = function(timeout)
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
                },
                timeout
            );
        };
        
        var viewer = this.up('viewerpanel');
        values.scanId = viewer.getScanId();
        
        var pages = 1;
        var firstExportPage = viewer.getPage() + 1;
        if (values.page == 'binding')
        {
            pages = viewer.getPageAmount();
            firstExportPage = 1;
        }
        else if (values.page == 'range')
        {
            pages = values.pageTo - values.pageFrom + 1;
            firstExportPage = parseInt(values.pageFrom);
        }
        
        var lastExportPage = firstExportPage + pages - 1;
        var time = Math.ceil(pages / 3);
        var size = Math.floor(0.1 + 1.2 * pages);
        
        if (time > 10 || size > 15)
        {
            var seconds = time % 60;
            var minutes = Math.floor(time / 60) % 60;
            var hours   = Math.floor(time / 3600);
            
            var timestr = '';
            
            if (hours > 0)   { timestr += hours   + 'h '; }
            if (minutes > 0) { timestr += minutes + 'm '; }
            if (seconds > 0) { timestr += seconds + 's '; }
                        
            var info;
            info = '<p>You are about to export ' + pages + ' pages. '
                 + 'This may take some time and the resulting file may be large.</p>'
                 + info
                 + '<p>Estimated processing time: ' + timestr + '<br/>'
                 + 'Estimated file size: ' + size + ' MB</p>';
            
            var confirm = new Ext.ux.ExportConfirmWindow({
                info: info,
                onContinue: function()
                {
                    sendRequest(3000 * time);
                    
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
            sendRequest(3000 * time);
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
                iconCls: 'cancel-icon',
                handler: function()
                {
                    _this.ownerCt.onCancel();
                }
            },{
                text: 'Continue',
                iconCls: 'save-icon',
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
            items: [{
                xtype: 'exportconfirmform',
                info: this.info
            }]
        };
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.AnnotationSearchPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.annotationsearchpanel',
    
    initComponent: function()
    {
        var _this = this;
        
        var resultStore = Ext.create('Ext.data.ArrayStore', {
            fields: ['annotationId', 'scanId', 'page', 'headline'],
            data: []
        });
        
        var defConfig = {
            layout: 'border',
            border: false,
            items: [{
                xtype: 'panel',
                region: 'north',
                border: false,
                name: 'search-query',
                layout: 'hbox',
                bodyPadding: 5,
                bodyCls: 'x-toolbar-default',
                items: [{
                    xtype: 'textfield',
                    flex: 1,
                    style: 'margin-right: 5px',
                    name: 'search-box',
                    emptyText: 'Enter your search query...',
                    submitEmptyText: false,
                    listeners: {
                        specialkey: function(field, event)
                        {
                            if (event.getKey() == event.ENTER)
                            {
                                _this.search();
                            }
                        }
                    }
                },{
                    xtype: 'button',
                    text: 'Search',
                    iconCls: 'search-icon',
                    handler: function()
                    {
                        _this.search();
                    }
                }]
            },{
                xtype: 'grid',
                name: 'search-results',
                region: 'center',
                border: false,
                columns: [{
                    text: 'Result (fragment)',
                    dataIndex: 'headline',
                    tdCls: 'wrap',
                    flex: 5
                },{
                    text: 'Page',
                    dataIndex: 'page',
                    flex: 1
                }],
                store: resultStore,
                listeners: {
                    itemclick: function(view, record)
                    {
                        var selectAnnotation = function()
                        {
                            setTimeout(function()
                            {
                                var annotations = _this.viewer.annotations;
                                var annotation = annotations.getAnnotationById(record.get('annotationId'));
                                annotations.getEventDispatcher().trigger('select', annotations, annotation);
                                var workspace = _this.up('workspacepanel');
                                workspace.setActiveTab(workspace.down('annotationspanel'));
                                _this.setLoading(false);
                                var i = 3;
                                var interval = 200;
                                var off;
                                var on = function()
                                {
                                    annotations.highlightAnnotation(annotation);
                                    setTimeout(off, interval);
                                }
                                off = function()
                                {
                                    i--;
                                    annotations.unhighlightAnnotation(annotation);
                                    if (i > 0)
                                    {
                                        setTimeout(on, interval);
                                    }
                                }
                                setTimeout(on, interval);
                            }, 1);
                        };
                        
                        if (_this.viewer.getPage() === record.get('page') - 1)
                        {
                            selectAnnotation();
                        }
                        else
                        {
                            _this.setLoading();
                            var viewer = _this.viewer.annotations.viewer;      
                            var store = _this.viewer.annotations.getStore();
                            var afterPageChange = function()
                            {
                                store.un('load', afterPageChange, this);
                                selectAnnotation();
                            };
                            store.on('load', afterPageChange, this);
                            _this.viewer.gotoPage(record.get('page') - 1);
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    search: function()
    {
        var _this = this;
        RequestManager.getInstance().request(
            'Annotation',
            'search',
            {
                bindingId: this.up('viewerpanel').getBinding().getModel().get('bindingId'),
                query: this.down('textfield').getValue()
            },
            this,
            function(data)
            {
                var store = this.down('[name=search-results]').getStore();
                store.loadData(data);
            },
            function()
            {
                return true;
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
        var _this = this;
        
        var defConfig = {
            layout: 'fit',
            border: false,
            items: [{
                xtype: 'annotationspanel',
                title: 'Annotations',
                viewer: this.viewer,
                iconCls: 'annotations-icon'
            },{
                title: 'Search',
                xtype: 'annotationsearchpanel',
                viewer: this.viewer,
                iconCls: 'search-icon'
            },{
                title: 'Export',
                xtype: 'exportform',
                viewer: this.viewer,
                iconCls: 'export-icon'
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Watch for authentication changes.
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('modelchange', this, this.onAuthenticationChange);
        
        this.onAuthenticationChange();
    },
    
    destroy: function()
    {
        // Unsubscribe from authentication changes.
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.unbind('modelchange', this, this.onAuthenticationChange);
        
        this.callParent();
    },
    
    onAuthenticationChange: function()
    {
        var auth = Authentication.getInstance();
        
        var notesPermission = auth.hasPermissionTo('manage-notebook');
        if (notesPermission && !this.down('notespanel'))
        {
            this.insert(1, {
                title: 'My notes',
                xtype: 'notespanel',
                viewer: this.viewer,
                iconCls: 'notes-icon'
            });
        }
        else if (!notesPermission && this.down('notespanel'))
        {
            this.remove(this.down('notespanel'));
        }
        
        var bindingUser = this.viewer.getBinding().getModel().get('userId');
        var currentUser = Authentication.getInstance().getUserId();

        // Only those who are allowed to change book info may delete bindings or modify those
        // not uploaded by themselves.
        var deletePermission = auth.hasPermissionTo('change-book-info')
        // Own books can always be modified.
        var modifyPermission = deletePermission || (bindingUser === currentUser);
        
        var showAdminPanel = modifyPermission || auth.hasPermissionTo('revert-changes');
        
        if (showAdminPanel && !this.down('bindingadminpanel'))
        {
            this.add({
                title: 'Administration',
                xtype: 'bindingadminpanel',
                viewer: this.viewer,
                iconCls: 'settings-icon'
            });
        }
        else if (!showAdminPanel && this.down('bindingadminpanel'))
        {
            this.remove(this.down('bindingadminpanel'));
        }
        
        if (this.down('bindingadminpanel'))
        {
            this.down('bindingadminpanel').showDelete(deletePermission);
            this.down('bindingadminpanel').showModify(modifyPermission);
        }
    }
});

