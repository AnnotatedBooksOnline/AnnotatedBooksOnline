/*
 * Annotations display and edit panel.
 */

var langStore = Ext.create('Ext.data.Store', {
    fields: ['lang', 'name'],
    data: [{
        lang: "eng",
        name:"English"
    },{
        lang: "orig",
        name: "Original language"
    }]
});

Ext.define('Ext.ux.AnnotationsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.annotationspanel',
    
    initComponent: function()
    {
        // Fetch annotations.
        this.annotations = this.viewer.getAnnotations();
        
        var _this = this;
        var defConfig = {
            border: false,
            layout: 'border',
            flex: 0,
            height: 600,
            items: [{
                region: 'north',
                html: 'Please select an annotation below.',
                bodyPadding: 5,
                border: false,
                autoScroll: true,
                height: 200,
                resizable: { handles: 's' }
            },{
                xtype: 'annotationsgrid',
                region: 'center',
                height: 350,
                viewer: this.viewer
            },{
                name: 'annotationcontrols',
                region: 'south',
                height: 70,
                border: false,
                bodyPadding: 10,
                items: [{
                    border: 'false',
                    layout: 'hbox',
                    items: [{
                        xtype: 'button',
                        text: 'Edit mode',
                        width: 135,
                        name: 'editmode',
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            this.up('annotationspanel').down('annotationsgrid').setEditMode();
                            this.up('annotationspanel').getComponent(0).hide();
                            this.hide();
                            this.up('[name=annotationcontrols]').down('[name=savechanges]').show();
                            this.up('[name=annotationcontrols]').down('[name=newtranscription]').show();
                            this.up('[name=annotationcontrols]').down('[name=viewmode]').show();
                        }
                    },{
                        xtype: 'button',
                        text: 'Back to view mode',
                        width: 135,
                        name: 'viewmode',
                        hidden: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            this.up('annotationspanel').down('annotationsgrid').setDisplayMode();
                            this.up('annotationspanel').getComponent(0).show();
                            this.hide();
                            this.up('[name=annotationcontrols]').down('[name=savechanges]').hide();
                            this.up('[name=annotationcontrols]').down('[name=newtranscription]').hide();
                            this.up('[name=annotationcontrols]').down('[name=editmode]').show();
                        }
                    },{
                        xtype: 'button',
                        text: 'New transcription',
                        width: 135,
                        name: 'newtranscription',
                        hidden: true,
                        handler: function()
                        {
                            // TODO: Show 'new transcription' tools.
                        }
                    }]
                },{
                    border: 'false',
                    layout: 'hbox',
                    style: 'margin-top: 5px',
                    items: [{
                        xtype: 'combobox',
                        store: langStore,
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'lang',
                        width: 135,
                        name: 'langchoose',
                        style: 'margin-right: 5px',
                        forceSelection: true,
                        editable: false,
                        listeners: {
                            select: function()
                            {
                                _this.setLanguage(this.getValue());
                            }
                        }
                    },{
                        xtype: 'button',
                        text: 'Save changes',
                        width: 135,
                        name: 'savechanges',
                        hidden: true,
                        disabled: true,
                        handler: function()
                        {
                            // TODO: Actually save changes.
                            this.setDisabled(true);
                        }
                    }]
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
        
        var langChooser = this.down('[name=langchoose]');
        langChooser.select('eng');
        langChooser.fireEvent('select', langChooser, {});
    },
    
    setLanguage: function(lang)
    {
        if (this.getComponent(0).activeRecord != undefined)
        {
            this.getComponent(0).body.update(this.getComponent(0).activeRecord.get(lang));
        }
        this.down('annotationsgrid').setLanguage(lang);
    },
    
    setLargeAnnotation: function(record)
    {
        this.getComponent(0).activeRecord = record;
        this.getComponent(0).body.update(record.get(this.down('[name=langchoose]').getValue()));
    },
    
    markDirty: function()
    {
        this.getComponent(2).down('[name=savechanges]').setDisabled(false);
    }
});

// TODO: remove when coupled to database
Ext.define('DataObject', {
    extend: 'Ext.data.Model',
    fields: ['annId', 'bookId', 'page', 'eng', 'orig', 'color']
});

Ext.define('Ext.ux.AnnotationsGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.annotationsgrid',
    
    initComponent: function()
    {
        // Fetch annotations.
        this.annotations = this.viewer.getAnnotations();
        
        // Watch for events.
        var eventDispatcher = this.annotations.getEventDispatcher();
        eventDispatcher.bind('select', this,
            function(event, annotations, annotation)
            {
                // TODO: I think we may want to have just one grid.
                
                this.getComponent(0).getSelectionModel().select(annotation.getModel());
                this.getComponent(1).getSelectionModel().select(annotation.getModel());
            });
        
        eventDispatcher.bind('hover', this,
            function(event, annotations, annotation)
            {
                // TODO: I think we may want to have just one grid.
                
                this.getComponent(0).getView().addRowCls(annotation.getModel(), 'x-grid-row-over');
                this.getComponent(1).getView().addRowCls(annotation.getModel(), 'x-grid-row-over');
            });
        
        eventDispatcher.bind('unhover', this,
            function(event, annotations, annotation)
            {
                // TODO: I think we may want to have just one grid.
                
                this.getComponent(0).getView().removeRowCls(annotation.getModel(), 'x-grid-row-over');
                this.getComponent(1).getView().removeRowCls(annotation.getModel(), 'x-grid-row-over');
            });
        
        // Fetch store.
        var store = this.annotations.getStore();
        
        var _this = this;
        var colorColumn = {
            dataIndex: 'color',
            renderer: function(color, metadata, model)
            {
                var color =_this.annotations.getAnnotationColor(
                    _this.annotations.getAnnotationByModel(model)
                );
                
                metadata.style = 'background-color: ' + color;
                metadata.tdCls = 'grid-valign-middle';
                
                return '';
            },
            width: 10
        };
        
        var getLanguageColumn = function(lang)
        {
            return {
                dataIndex: lang,
                renderer: function(text, meta)
                {
                    meta.style = 'white-space: normal;';
                    if (text.length >= 120)
                    {
                        text = text.substr(0, 117) + '...';
                    }
                    return text;
                }
            };
        };

        var getDisplayColumns = function(lang)
        {
            return [colorColumn, getLanguageColumn(lang)];
        };
        
        var getEditColumns = function(lang)
        {
            return [colorColumn, getLanguageColumn(lang),
            {
                dataIndex: 'annId',
                renderer: function(annId, meta, rec, r, c, s, view)
                {
                    meta.tdCls = 'grid-valign-bottom';
                    
                    var id = Ext.id();
                    setTimeout(function()
                    {
                        try
                        {
                            new Ext.Button(
                            {
                                renderTo: id,
                                id: id,
                                text: 'Edit'
                            });
                        }
                        catch (e)
                        {
                            // Too late.
                        }
                    }, 1);

                    return '<div id="' + id + '"></div>';
                },
                width: 20,
                flex: 0
            }];
        };
        
        var displayMode = {
            xtype: 'gridpanel',
            viewConfig: {
                stripeRows: false,
                listeners: {
                    itemclick: function(grid, model)
                    {
                        this.up('annotationspanel').setLargeAnnotation(model);
                    },
                    itemmouseenter: function(grid, model)
                    {
                        var annotation = _this.annotations.getAnnotationByModel(model);
                        
                        _this.annotations.highlightAnnotation(annotation);
                    },
                    itemmouseleave: function(grid, model)
                    {
                        var annotation = _this.annotations.getAnnotationByModel(model);
                        
                        _this.annotations.unhighlightAnnotation(annotation);
                    }
                }
            },
            hideHeaders: true,
            store: store,
            columns: getDisplayColumns('orig'),
            forceFit: true,
            autoScroll: true,
            border: false
        };
        
        var editMode = {
            xtype: 'gridpanel',
            viewConfig: {
                stripeRows: false,
                listeners: {
                    itemupdate: function()
                    {
                        console.log('update');
                        this.up('annotationspanel').markDirty();
                    }
                }
            },
            hideHeaders: true,
            store: store,
            columns: getEditColumns('orig'),
            forceFit: true,
            autoScroll: true,
            border: false
        };
        
        var defConfig = {
            border: false,
            layout: 'card',
            items: [displayMode, editMode],
            setLanguage: function(lang)
            {
                var _this = this;
                setTimeout(function()
                {
                    _this.getComponent(0).reconfigure(null, getDisplayColumns(lang));
                    _this.getComponent(1).reconfigure(null, getEditColumns(lang));
                }, 1);
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    setEditMode: function()
    {
        this.getLayout().setActiveItem(1);
    },
    
    setDisplayMode: function()
    {
        this.getLayout().setActiveItem(0);
    }
});
