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
                html: 'Modify binding and book information, such as title, author and provenance.'
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
                html: 'View previous versions of transcriptions or restore them.'
            },{
                xtype: 'button',
                text: 'Revisions',
                name: 'annotationrevisionsbutton',
                width: 110,
                iconCls: 'revise-annotations-icon',
                handler: function()
                {
                     var scanId = this.up('viewerpanel').getScanId();
                    
                     var window = Ext.create('Ext.window.Window', {
                        title: 'Revisions',
                        modal: true,
                        constrain: true,
                        closable: true,
                        autoScroll: true,
                        width: 800,
                        height: 600,
                        items: [{
                            xtype: 'label',
                            border: 3,
                            padding: 3,
                            margin: 5,
                            layout:{ align: 'middle' },
                            text: 'Double-click a revision in order to restore it.'
                        },{
                            xtype: 'revisionspanel',
                            border: false,
                            scanId: scanId
                        }]
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
                    xtype: 'panel',
                    border: false,
                    name: 'transcriptionoptions',
                    style: 'margin-left: 20px;',
                    items: [{
                        xtype: 'combobox',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['lang', 'text'],
                            data: [{
                                lang: 'orig',
                                text: 'Original'
                            },{
                                lang: 'eng',
                                text: 'English'
                            },{
                                lang: 'both',
                                text: 'Both'
                            }]
                        }),
                        queryMode: 'local',
                        displayField: 'text',
                        valueField: 'lang',
                        forceSelection: true,
                        editable: false,
                        fieldLabel: 'Language',
                        disabled: true,
                        name: 'language',
                        listeners: {
                            afterrender: function()
                            {
                                this.select('orig');
                            }
                        }
                    },{
                        xtype: 'checkbox',
                        name: 'polygons',
                        checked: false,
                        boxLabel: 'Display polygons on scan',
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
            
            var binding = viewer.getBinding().getModel();
            var books = [];
            
            binding.books().each(
                function(book)
                {
                    if (book.get('lastPage') >= firstExportPage && book.get('firstPage') <= lastExportPage)
                    {
                        books.push(book);
                    }
                }
            );
            
            var toString = function(s)
            {
                if (s)
                {
                    return s;
                }
                return '';
            };
            
            var info = '<p><table style="width: 100%; margin-left: 10px; margin-right: 10px">';
            
            if (books.length == 1)
            {
                var authors = '';
                books[0].authors().each(
                function(author)
                {
                    if (authors.length != 0)
                    {
                        authors += ', ';
                    }
                    authors += author.get('name');
                });
                var year = books[0].get('minYear');
                if (year != books[0].get('maxYear'))
                {
                    year = year + ' - ' + books[0].get('maxYear');
                }
                
                info += '<tr><td>Title</td><td>' + escape(books[0].get('title')) + '</td></tr>'
                      + '<tr><td>Author</td><td>' + escape(authors) + '</td></tr>'
                      + '<tr><td>Year</td><td>' + escape("" + year) + '</td></tr>'
                      + '<tr><td>Location</td><td>' + escape(toString(books[0].get('placePublished'))) + '</td></tr>'
                      + '<tr><td>Publisher</td><td>' + escape(toString(books[0].get('publisher'))) + '</td></tr>';
            }
            else if (books.length != 0)
            {
                info += '<tr style="vertical-align: top"><td>Titles</td><td>';
                for (var i = 0; i < books.length; i++)
                {
                    info += escape(books[i].get('title')) + '<br/>';
                }
                info += '</td></tr>';
            }
            
            info += '<tr><td>Library</td><td>' + escape(binding.get('library').libraryName) + '</td></tr>'
                  + '<tr><td style="width: 30%">Shelfmark</td><td>' + escape(binding.get('signature')) + '</td></tr>'
                  + '</table></p>';
            
            info = '<p>You are about to export ' + pages + ' scans. '
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
        
        if (modifyPermission && !this.down('bindingadminpanel'))
        {
            this.add({
                title: 'Administration',
                xtype: 'bindingadminpanel',
                viewer: this.viewer,
                iconCls: 'notes-icon' // TODO
            });
        }
        else if (!modifyPermission && this.down('bindingadminpanel'))
        {
            this.remove(this.down('bindingadminpanel'));
        }
        
        if (deletePermission)
        {
            this.down('bindingadminpanel').showDelete(true);
            this.down('bindingadminpanel').showModify(true);
        }
        else if (modifyPermission)
        {
            this.down('bindingadminpanel').showDelete(false);
            this.down('bindingadminpanel').showModify(true);
        }
    }
});
