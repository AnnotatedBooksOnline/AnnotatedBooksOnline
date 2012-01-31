/*
 * Annotations display and edit panel.
 */

// Because of an Ext JS bug, the loading screen appears in the upperleft corner when
// the annotations tab is closed. The following code prevents that.
Ext.override(Ext.view.AbstractView, {
    onMaskBeforeShow: function()
    {
        if (!this.el.isVisible(true))
        {
            return false;
        }
        
        this.callOverridden(arguments);
    }
});

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
        var _this = this;
        var defConfig = {
            border: false,
            layout: 'border',
            items: [{
                xtype: 'panel',
                region: 'north',
                layout: 'anchor',
                bodyPadding: 5,
                border: false,
                height: 200,
                resizable: { handles: 's' },
                items: [{
                    html: 'Please select an annotation below.',
                    anchor: '0, -60',
                    autoScroll: true,
                    name: 'active-annotation'
                },{
                    xtype: 'panel',
                    height: '60', //should be 3em or something similar
                    name: 'annotation-history',
                    autoScroll: true,
                    html: '',
                    cls: 'annoHistory'
                }]
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
                    border: false,
                    layout: 'hbox',
                    items: [{
                        xtype: 'button',
                        text: 'Save',
                        width: 135,
                        name: 'save-changes',
                        iconCls: 'accept-icon',
                        disabled: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            _this.saveChanges();
                        }
                    },{
                        xtype: 'button',
                        text: 'Reset',
                        width: 135,
                        iconCls: 'cancel-icon',
                        name: 'reset-changes',
                        disabled: true,
                        handler: function()
                        {
                            _this.resetChanges();
                        }
                    }]
                },{
                    border: false,
                    layout: 'hbox',
                    style: 'margin-top: 5px',
                    items: [{
                        xtype: 'button',
                        text: 'Edit mode',
                        width: 135,
                        name: 'edit-mode',
                        iconCls: 'edit-mode-icon',
                        disabled: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            _this.setMode('edit');
                        }
                    },{
                        xtype: 'button',
                        text: 'View mode',
                        width: 135,
                        iconCls: 'view-mode-icon', // TODO
                        name: 'view-mode',
                        disabled: true,
                        hidden: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            _this.setMode('view');
                        }
                    },{
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
        
        // Set to view mode.
        this.mode = 'view';
        
        // Fetch annotations.
        this.annotations = this.viewer.getAnnotations();
        
        // Fetch some components.
        this.langChooser      = this.down('[name=lang-chooser]');
        this.activeAnnotation = this.down('[name=active-annotation]');
        this.annotationHist   = this.down('[name=annotation-history]');
        this.controls         = this.down('[name=controls]');
        this.grid             = this.down('[name=grid]');
        this.saveChangesBtn   = this.down('[name=save-changes]');
        this.resetChangesBtn  = this.down('[name=reset-changes]');
        this.editMode         = this.down('[name=edit-mode]');
        this.viewMode         = this.down('[name=view-mode]');
        
        // Set language.
        this.setLanguage('transcriptionEng');
        
        // Handle current authentication state.
        this.onAuthenticationChange();
        
        // Watch for removal.
        var store = this.annotations.getStore();
        store.on('remove',
            function(store, model)
            {
                if (model === this.activeModel)
                {
                    this.activeModel = undefined;
                    
                    this.setActiveAnnotation(undefined);
                }
            }, this);
        
        // Watch for change.
        var eventDispatcher = this.annotations.getEventDispatcher();
        eventDispatcher.bind('change', this,
            function(event, annotations)
            {
                // Enable save and reset buttons.
                this.saveChangesBtn.setDisabled(false);
                this.resetChangesBtn.setDisabled(false);
                
                // Reset active model.
                this.setActiveAnnotation(this.activeModel);
            });
        
        // Watch for clear.
        var eventDispatcher = this.annotations.getEventDispatcher();
        eventDispatcher.bind('clear', this,
            function(event, annotations)
            {
                // Unset active model.
                this.activeModel = undefined;
                this.setActiveAnnotation(undefined);
            });
        
        // Watch for load.
        var eventDispatcher = this.annotations.getEventDispatcher();
        eventDispatcher.bind('load', this,
            function(event, annotations)
            {
                // Disable save and reset buttons.
                this.saveChangesBtn.setDisabled(true);
                this.resetChangesBtn.setDisabled(true);
            });
        
        // Watch for save.
        var eventDispatcher = this.annotations.getEventDispatcher();
        eventDispatcher.bind('save', this,
            function(event, annotations, annotation)
            {
                // Disable save and reset buttons.
                this.saveChangesBtn.setDisabled(true);
                this.resetChangesBtn.setDisabled(true);
            });
        
        // Handle authentication model changes.
        Authentication.getInstance().getEventDispatcher().bind('modelchange', this, this.onAuthenticationChange);
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
        if ((model !== undefined) && (this.mode === 'edit'))
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
        
        // Fetch annotation history
        this.updateHistory(model);
    },
    
    updateHistory: function(model)
    {
        var history = '';
        if (model !== undefined)
        {
            var user = Authentication.getInstance().getUserModel()
            var createdName = 'Unknown';
            var changedName = 'Unknown';
            if (user != undefined)
            {
                createdName = user.getFullName();
                changedName = user.getFullName();
            }
            var timeCreated = 'now';
            var timeChanged = 'now';
            
            createdName = model.get('createdName');
            changedName = model.get('changedName');
            
            // TODO: Make a good layout of the table.
            if (model.get('timeCreated') != undefined && model.get('timeCreated') != null)
            {
                timeCreated = Ext.Date.format(model.get('timeCreated'), 'F j, Y');
            }
            if (model.get('timeChanged') != undefined && model.get('timeChanged') != null)
            {
                timeChanged = Ext.Date.format(model.get('timeChanged'), 'F j, Y');
            }
            
            history = '<b> Created by: </b>' + createdName + '<br>' +
                '<p style="color:#333;font-size:11px;"> on ' + timeCreated + '<br></p>' +
                '<b> Last modified by: </b>' + changedName + '<br>' +
                '<p style="color:#333;font-size:11px;"> on ' + timeChanged + '<br></p>' 
        }
        
        this.annotationHist.body.update(history);
    },
    
    markDirty: function()
    {
        this.saveChangesBtn.setDisabled(false);
    },
    
    // Sets mode. Mode can be 'edit' or 'view'.
    setMode: function(mode, force)
    {
        this.mode = mode;
        
        if (mode === 'edit')
        {
            this.editMode.hide();
            this.viewMode.show();
            this.saveChangesBtn.setDisabled(true);
            this.resetChangesBtn.setDisabled(true);
            
            this.viewer.showTools();
        }
        else
        {
            this.editMode.show();
            this.viewMode.hide();
            this.saveChangesBtn.setDisabled(true);
            this.resetChangesBtn.setDisabled(true);
            
            this.viewer.hideTools();
            
            // Handle unsaved changes.
            if (this.annotations.hasChanges())
            {
                if (force)
                {
                    // Reset changes.
                    this.resetChanges();
                }
                else
                {
                    // Ask user whether to save changes.
                    var _this = this;
                    Ext.Msg.confirm('Save changes?', 'Do you want to save changes?', 
                        function(button)
                        {
                            if (button === 'yes')
                            {
                                // Save changes.
                                _this.saveChanges();
                            }
                            else
                            {
                                // Reset changes.
                                _this.resetChanges();
                            }
                        }
                    );
                }
            }
        }
        
        // Reset active model.
        this.setActiveAnnotation(this.activeModel);
        
        // Set mode of grid.
        this.grid.setMode(mode);
    },
    
    saveChanges: function()
    {
        // Ask user whether to save changes.
        var _this = this;
        Ext.Msg.confirm('Save changes?', 'Do you want to save changes?', 
            function(button)
            {
                if (button === 'yes')
                {
                    // Save changes.
                    _this.annotations.save();
                    _this.annotations.load();
                    _this.updateHistory(this.activeModel);
                }
            }
        );
    },
    
    resetChanges: function()
    {
        // Unset active annotation.
        this.setActiveAnnotation(undefined);
        
        // Reset annotations.
        this.annotations.reset();
    },
    
    onAuthenticationChange: function()
    {
        var permission = Authentication.getInstance().hasPermissionTo('add-annotations');
        
        if (permission)
        {
            // Set view change mode buttons enabled.
            this.editMode.setDisabled(false);
            this.viewMode.setDisabled(false);
        }
        else
        {
            // Check if in edit mode.
            if (this.mode === 'edit')
            {
                this.setMode('view', true);
            }
            
            // Set view change mode buttons disabled.
            this.editMode.setDisabled(true);
            this.viewMode.setDisabled(true);
        }
    }
});

Ext.define('Ext.ux.AnnotationsGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.annotationsgrid',
    
    initComponent: function()
    {
        // Fetch annotations.
        this.annotations = this.viewer.getAnnotations();
        
        // Fetch store.
        var store = this.annotations.getStore();
        
        // Set view config.
        var _this = this;
        var defConfig = {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragText: 'Drag and drop to reorganize',
                    pluginId: 'dragdrop'
                },
                stripeRows: false,
                listeners: {
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
                    },
                    drop: function(node, data, overModel)
                    {
                        // Unhighlight over model.
                        var annotation = _this.annotations.getAnnotationByModel(overModel);
                        
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
        
        // Fetch DragDrop plugin
        this.dragdrop = this.getView().getPlugin('dragdrop');
        
        // Set mode.
        this.mode = 'view';
        this.dragdrop.disable();
        
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
        
        eventDispatcher.bind('add', this,
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
        
        var _this = this;
        this.getSelectionModel().on('selectionchange',
            function(selectionModel, models)
            {
                // Make this annotation active.
                if (models.length > 0)
                {
                    _this.up('annotationspanel').setActiveAnnotation(models[0]);
                }
            }
        );
    },
    
    getColumns: function()
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
            dataIndex: this.language,
            renderer: function(text, metadata)
            {
                return _this.renderLanguage(text, metadata);
            },
            flex: 1
        };
        
        var editButtonColumn = {
            dataIndex: 'annotationId',
            align: 'right',
            renderer: function(annotationId, metaData, model)
            {
                // Get component id.
                var id = 'button_' + Ext.id();
                
                // Render button delayed.
                var _this = this;
                setTimeout(function()
                    {
                        // Empty div as there may be an older button.
                        $('#' + id).empty();
                        
                        try
                        {
                            new Ext.Button({
                                renderTo: id,
                                text: 'Edit',
                                iconCls: 'transcription-edit-icon',
                                style: 'margin-right: 5px;',
                                handler: function()
                                {
                                    var window = new Ext.ux.TranscriptionEditorWindow({
                                        annotation: model
                                    });
                                    
                                    window.show();
                                }
                            });
                        }
                        catch (e)
                        {
                            // Model might already have been removed/replaced.
                        }
                    }, 1);
                
                return '<div style="height: 22px;" id="' + id + '">&nbsp;</div>';
            },
            width: 66
        };
        
        if (this.mode === 'edit')
        {
            return [colorColumn, languageColumn, editButtonColumn];
        }
        else
        {
            return [colorColumn, languageColumn];
        }
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
        
        // Check for null or undefined.
        if (!text)
        {
            return '';
        }
        
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
        // Set language.
        this.language = language;
        
        // Set new columns.
        var _this = this;
        setTimeout(function()
        {
            _this.reconfigure(null, _this.getColumns());
        }, 1);
    },
    
    // Sets mode. Mode can be 'edit' or 'view'.
    setMode: function(mode)
    {
        // Set mode.
        this.mode = mode;
        
        // Set new columns.
        var _this = this;
        setTimeout(function()
        {
            _this.reconfigure(null, _this.getColumns());
        }, 1);
        
        // Set dragdrop
        if (mode === 'edit')
        {
            this.dragdrop.enable();
        }
        else
        {
            this.dragdrop.disable();
        }
    }
});
