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
        var time = Math.ceil(pages / 20);
        var size = Math.floor(0.4 + 1.2 * pages);
        
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
                      + '<tr><td>Year</td><td>' + escape(year) + '</td></tr>'
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
        var notesPermission = Authentication.getInstance().hasPermissionTo('manage-notebook');
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
    }
});
