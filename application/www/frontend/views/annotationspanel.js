/*
 * Annotations display and edit panel.
 */

var langStore = Ext.create('Ext.data.Store', {
    fields: ['lang', 'name'],
    data: [{
        lang: "transcriptionEng",
        name:"English"
    },{
        lang: "transcriptionOrig",
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
            items: [{
                region: 'north',
                html: 'Please select an annotation below.',
                name: 'active-annotation',
                bodyPadding: 5,
                border: false,
                autoScroll: true,
                height: 200,
                resizable: { handles: 's' }
            },{
                xtype: 'annotationsgrid',
                name: 'grid',
                region: 'center',
                height: 350,
                viewer: this.viewer
            },{
                name: 'controls',
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
                        name: 'edit-mode',
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            _this.setMode('edit');
                        }
                    },{
                        xtype: 'button',
                        text: 'Back to view mode',
                        width: 135,
                        name: 'view-mode',
                        hidden: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            _this.setMode('view');
                        }
                    },{
                        xtype: 'button',
                        text: 'New transcription',
                        width: 135,
                        name: 'new-transcription',
                        hidden: true,
                        handler: function()
                        {
                            _this.createNewTranscription();
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
                        name: 'lang-chooser',
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
                        name: 'save-changes',
                        hidden: true,
                        disabled: true,
                        handler: function()
                        {
                            _this.saveChanges();
                        }
                    }]
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Fetch some components.
        this.langChooser      = this.down('[name=lang-chooser]');
        this.activeAnnotation = this.down('[name=active-annotation]');
        this.controls         = this.down('[name=controls]');
        this.grid             = this.down('[name=grid]');
        this.saveChangesBtn   = this.down('[name=save-changes]');
        this.editMode         = this.down('[name=edit-mode]');
        this.viewMode         = this.down('[name=view-mode]');
        this.newTranscription = this.down('[name=new-transcription]');
        
        // Set language.
        this.setLanguage('transcriptionEng');
    },
    
    setLanguage: function(language)
    {
        // Store language.
        this.language = language;
        
        // Set language on selector.
        this.langChooser.select(language);
        
        // Set language on grid.
        this.grid.setLanguage(language);
        
        // Reset active model.
        this.setActiveAnnotation(this.activeModel);
    },
    
    setActiveAnnotation: function(model)
    {
        // Unset edit mode of previously selected model.
        if (this.activeModel !== undefined)
        {
            this.annotations.uneditAnnotation(this.annotations.getAnnotationByModel(this.activeModel));
        }
        
        // Set edit mode of new model.
        if (model !== undefined)
        {
            this.annotations.editAnnotation(this.annotations.getAnnotationByModel(model));
        }
        
        // Set active model.
        this.activeModel = model;
        
        // Fetch text in current language.
        var text = '';
        if (model !== undefined)
        {
            text = model.get(this.language);
        }
        
        // Show contents of new model.
        this.activeAnnotation.body.update(escape(text));
    },
    
    markDirty: function()
    {
        this.saveChangesBtn.setDisabled(false);
    },
    
    // Sets mode. Mode can be 'edit' or 'view'.
    setMode: function(mode)
    {
        this.mode = mode;
        
        if (mode === 'edit')
        {
            this.editMode.hide();
            this.viewMode.show();
            this.saveChangesBtn.setDisabled(true);
            this.saveChangesBtn.show();
            this.newTranscription.show();
        }
        else
        {
            this.editMode.show();
            this.viewMode.hide();
            this.saveChangesBtn.setDisabled(true);
            this.saveChangesBtn.hide();
            this.newTranscription.hide();
        }
        
        // Reset active model.
        this.setActiveAnnotation(this.activeModel);
        
        // TODO: Handle unsaved records.
    },
    
    createNewTranscription: function()
    {
        // TODO: Implement.
    },
    
    saveChanges: function()
    {
        // TODO: Actually save changes.
        this.saveChangesBtn.setDisabled(true);
        
        // Save annotations.
        this.annotations.save();
    }
});

Ext.define('Ext.ux.AnnotationsGrid', {
    extend: 'Ext.grid.Panel',
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
                // Select this annotation.
                this.getSelectionModel().select(annotation.getModel());
                
                // Make this annotation active.
                this.up('annotationspanel').setActiveAnnotation(annotation.getModel());
            });
        
        eventDispatcher.bind('hover', this,
            function(event, annotations, annotation)
            {
                this.getView().addRowCls(annotation.getModel(), 'x-grid-row-over');
            });
        
        eventDispatcher.bind('unhover', this,
            function(event, annotations, annotation)
            {
                this.getView().removeRowCls(annotation.getModel(), 'x-grid-row-over');
            });
        
        // Fetch store.
        var store = this.annotations.getStore();
        
        // Set view config.
        var _this = this;
        var defConfig = {
            viewConfig: {
                stripeRows: false,
                listeners: {
                    itemclick: function(grid, model)
                    {
                        // Make this annotation active.
                        this.up('annotationspanel').setActiveAnnotation(model);
                    },
                    itemmouseenter: function(grid, model)
                    {
                        // Hightlight this annotation.
                        var annotation = _this.annotations.getAnnotationByModel(model);
                        
                        _this.annotations.highlightAnnotation(annotation);
                    },
                    itemmouseleave: function(grid, model)
                    {
                        // Unhighlight this annotation.
                        var annotation = _this.annotations.getAnnotationByModel(model);
                        
                        _this.annotations.unhighlightAnnotation(annotation);
                    }
                }
            },
            hideHeaders: true,
            store: store,
            columns: this.getColumns('transcriptionEng'),
            forceFit: true,
            autoScroll: true,
            border: false
        };
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Fetch some components.
        
    },
    
    getColumns: function(language)
    {
        // Set color column.
        var _this = this;
        var colorColumn = {
            dataIndex: 'color',
            renderer: function(color, metadata, model)
            {
                return _this.renderColor(color, metadata, model);
            },
            width: 10
        };
        
        // Set language column.
        var languageColumn = {
            dataIndex: language,
            renderer: function(language, metadata) { return _this.renderLanguage(language, metadata); }
        };

        return [colorColumn, languageColumn];
    },
    
    renderColor: function(color, metadata, model)
    {
        var color = this.annotations.getAnnotationColor(
            this.annotations.getAnnotationByModel(model)
        );
        
        metadata.style = 'background-color: ' + color;
        metadata.tdCls = 'grid-valign-middle';
        
        return '';
    },
    
    renderLanguage: function(text, metadata)
    {
        // Retain whitespace.
        metadata.style = 'white-space: normal;';
        
        // Replace newlines with spaces.
        text = text.replace(/\s*(\r\n|\n|\r)\s*/g, ' ');
        
        // Cut off text if too long.
        if (text.length >= 120)
        {
            text = text.substr(0, 117) + '...';
        }
        
        return escape(text);
    },
    
    setLanguage: function(language)
    {
        // NOTE: Why a timeout?
        
        var _this = this;
        setTimeout(function()
        {
            _this.reconfigure(null, _this.getColumns(language));
        }, 1);
    }
});
