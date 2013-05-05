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

var langStoreData = (function()
{
    var result = [];
    var categories = reorderByAnnotationInfoOrder(getAnnotationInfoCategories());
    var index = reorderByAnnotationInfoOrder(getDefaultAnnotationInfoOrder());
    for(var i = 0; i < categories.length; ++i)
    {
        if (categories[i].charAt(0) != '_')
        {
            result.push({
                lang: index[i],
                name: categories[i]
            });
        }
    }
    return result;
    //reorderByAnnotationInfoOrder(langStoreData)
})();

var langStore = Ext.create('Ext.data.Store', {
    fields: ['lang', 'name'],
    data: langStoreData
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
                region: 'north',
                layout: 'border',
                split: false,
                border: false,
                flex: 3,
                resizable: { handles: 's' },
                items: [{
                    html: 'Please select an annotation below.',
                    region: 'center',
                    name: 'active-annotation',
                    border: false,
                    bodyPadding: 5,
                    autoScroll: true,
                    cls: 'annotation-text'
                },{
                    xtype: 'panel',
                    region: 'south',
                    name: 'annotation-history',
                    style: 'margin-top: 3px;',
                    height: 65,
                    html: '',
                    cls: 'annoHistory',
                    border: false,
                    bodyPadding: 5
                }]
            },{
                xtype: 'annotationsgrid',
                name: 'grid',
                flex: 2,
                region: 'center',
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
                        text: 'Revert',
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
                        iconCls: 'view-mode-icon',
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
        
        // Set language to the first one.
        this.setLanguage(0);
        
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
                // Enable/disable save and reset buttons.
                this.updateButtons();
                
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
        
        // Prevent this viewer panel from being closed when there are dirty annotations.
        this.up('viewerpanel').on('beforeclose', function()
        {
                        // Handle unsaved changes.
            if (this.annotationsAreDirty() && this.forceClose !== true)
            {
                var _this = this;
                var changeInfo = this.getChangeInfo();
                // Ask user whether to save changes.
                Ext.Msg.show({
                    buttons: Ext.Msg.YESNOCANCEL,
                    closable: false,
                    icon: Ext.Msg.QUESTION,
                    title: 'Save changes?',
                    msg: 'There are unsaved changes (' + changeInfo + ').<br/>' +
                    ' Do you want to save these changes? Select Yes to make your ' +
                    'changes visible to all visitors, select No to close this ' +
                    'tab without saving. Select Cancel to ' +
                    'continue editing.', 
                    fn: function(button)
                    {
                        if (button === 'yes')
                        {
                            // Save changes, then close the tab.
                            _this.saveChanges(true);
                            _this.forceClose = true;
                            setTimeout(function()
                            {
                                _this.up('viewerpanel').close();
                            }, 100);
                        }
                        else if (button === 'no')
                        {
                            // Just close the tab.
                            _this.forceClose = true;
                            _this.up('viewerpanel').close();
                        }
                        else
                        {
                            // Do nothing, stay in edit mode.
                        }
                    }
                });
                return false;
            }
            return true;
        }, this);
    },
    
    destroy: function()
    {
        // Unsubscribe from authentication changes.
        Authentication.getInstance().getEventDispatcher().unbind('modelchange', this, this.onAuthenticationChange);
        
        this.callParent();
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
            for (var i = 0; i < langStoreData.length; i++)
            {
                var lang = langStoreData[i];
                var data = model.get('annotationInfo')[lang.lang];
                if (data)
                {
                    text += '<h3>' + lang.name + '</h3>';
                    text += '<p>' + escape(data) + '</p>';
                }
            }
        }
        
        // Show contents of new model.
        this.activeAnnotation.body.update(text);
        
        // Fetch annotation history
        this.updateHistory(model);
    },
    
    updateHistory: function(model)
    {
        var history = '';
        if (model !== undefined)
        {
            // Fetch user name.
            var createdName = 'Unknown';
            var changedName = 'Unknown';
            
            // Default to our own user name.
            var user = Authentication.getInstance().getUserModel();
            if (user !== undefined)
            {
                createdName = user.getFullName();
                changedName = user.getFullName();
            }
            
            // Default to current date.
            var timeCreated = Ext.Date.format(new Date(Ext.Date.now()), 'F j, Y');
            var timeChanged = Ext.Date.format(new Date(Ext.Date.now()), 'F j, Y');
            
            // Set created info from model if available.
            if (model.get('createdName') && model.get('timeCreated'))
            {
                createdName = model.get('createdName');
                if (createdName === ' ')
                {
                    createdName = 'deleted user'
                }
                timeCreated = Ext.Date.format(model.get('timeCreated'), 'F j, Y');
            }
            
            // Set changed info from model if available.
            if (model.get('changedName') && model.get('timeChanged'))
            {
                changedName = model.get('changedName');
                if (changedName === ' ')
                {
                    changedName = 'deleted user'
                }
                timeChanged = Ext.Date.format(model.get('timeChanged'), 'F j, Y');
            }
            
            // Create history HTML.
            history = '<b> Created by: </b>' + escape(createdName) + '<br>' +
                '<p style="color: #333; font-size: 11px;"> on ' + escape(timeCreated) + '<br></p>' +
                '<b> Last modified by: </b>' + escape(changedName) + '<br>' +
                '<p style="color: #333; font-size: 11px;"> on ' + escape(timeChanged) + '<br></p>';
        }
        
        this.annotationHist.body.update(history);
    },
    
    // Marks the current view dirty by enabling the Save and Revert button.
    updateButtons: function()
    {
        if (this.annotationsAreDirty())
        {
            this.saveChangesBtn.setDisabled(false);
            this.resetChangesBtn.setDisabled(false);
        }
        else
        {
            this.saveChangesBtn.setDisabled(true);
            this.resetChangesBtn.setDisabled(true);
        }
    },
    
    // Checks whether annotations have changed.
    annotationsAreDirty: function()
    {
        return (this.annotations.hasChanges() && this.getChangeInfo() != '');
    },
    
    // Returns information on the number of changes made.
    getChangeInfo: function()
    {
        if (!this.annotations || !this.annotations.getStore())
            return '';

        var store = this.annotations.getStore();
        changeInfo = [];
        if (store.getNewRecords().length > 0)
        {
            changeInfo.push(store.getNewRecords().length + ' new');
        }
        if (store.getRemovedRecords().length > 0)
        {
            changeInfo.push(store.getRemovedRecords().length + ' removed');
        }
        if (store.getUpdatedRecords().length > 0)
        {
            changeInfo.push(store.getUpdatedRecords().length + ' updated');
        }
        return changeInfo.join(', ');
    },
    
    // Sets mode. Mode can be 'edit' or 'view'.
    setMode: function(mode, force)
    {
        var _this = this;
        
        var updateGrid = function()
        {       
            // Reset active model.
            _this.setActiveAnnotation(this.activeModel);
            
            // Set mode of grid.
            _this.grid.setMode(mode);
        };
        
        if (mode === 'edit')
        {
            // Switch to view mode.
            this.mode = mode;
            
            this.editMode.hide();
            this.viewMode.show();
            this.saveChangesBtn.setDisabled(true);
            this.resetChangesBtn.setDisabled(true);
            
            this.viewer.showTools();
            
            updateGrid();
        }
        else
        {
            // Switch to edit mode.
            var setViewMode = function()
            {
                _this.mode = mode;
                                
                _this.editMode.show();
                _this.viewMode.hide();
                _this.saveChangesBtn.setDisabled(true);
                _this.resetChangesBtn.setDisabled(true);
                
                _this.viewer.hideTools();
                
                updateGrid();
            };
            
            // Handle unsaved changes.
            if (this.annotationsAreDirty())
            {
                if (force)
                {
                    // Reset changes.
                    this.resetChanges();
                    setViewMode();
                }
                else
                {
                    var changeInfo = this.getChangeInfo();
                    // Ask user whether to save changes.
                    Ext.Msg.show({
                        buttons: Ext.Msg.YESNOCANCEL,
                        closable: false,
                        icon: Ext.Msg.QUESTION,
                        title: 'Save changes?',
                        msg: 'There are unsaved changes (' + changeInfo + ').<br/>' +
                        ' Do you want to save these changes? Select Yes to make your ' +
                        'changes visible to all visitors, select No to revert all ' +
                        'changes you made since the last save. Select Cancel to ' +
                        'continue editing.', 
                        fn: function(button)
                        {
                            if (button === 'yes')
                            {
                                // Save changes.
                                _this.saveChanges(true);
                                setViewMode();
                            }
                            else if (button === 'no')
                            {
                                // Reset changes.
                                _this.resetChanges(true);
                                setViewMode();
                            }
                            else
                            {
                                // Do nothing, stay in edit mode.
                            }
                        }
                    });
                }
            }
            else
            {
                setViewMode();
            }
        }
    },
    
    askSaveChanges: function()
    {
        // Ask user whether to save changes.
        var _this = this;
        Ext.Msg.confirm('Save changes?', 'Do you want to save changes (' +
            this.getChangeInfo() + ')?<br/>This will make your changes visible to all ' +
            'visitors.', 
            function(button)
            {
                if (button === 'yes')
                {
                    _this.saveChanges(true);
                }
            }
        );
    },
    
    saveChanges: function(force)
    {
        if (force === true)
        {
            // Save changes.
            this.annotations.save();
            this.annotations.load();
            this.updateHistory(this.activeModel);
        }
        else
        {
            this.askSaveChanges();
        }
    },
    
    askResetChanges: function()
    {
        // Ask user whether to save changes.
        var _this = this;
        Ext.Msg.confirm('Revert changes?', 'Do you want to revert changes (' +
            this.getChangeInfo() + ')?<br/>This will revert all changes you made since' +
            ' the last save.', 
            function(button)
            {
                if (button === 'yes')
                {
                    _this.resetChanges(true);
                }
            }
        );
    },
    
    resetChanges: function(force)
    {
        if (force === true)
        {
            // Unset active annotation.
            this.setActiveAnnotation(undefined);
            
            // Reset annotations.
            this.annotations.reset();
        }
        else
        {
            this.askResetChanges();
        }
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
    },
    
    reloadAnnotations: function()
    {
        this.annotations.reset(true);
        this.updateHistory(this.activeModel);
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
                },
                overItemCls: 'annotations-grid-over',
                selectedItemCls: 'annotations-grid-selected'
            },
            hideHeaders: true,
            store: store,
            columns: this.getColumns('annotationInfo'),
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
        
        // Fetch drag and drop plugin, and disable it.
        this.dragdrop = this.getView().getPlugin('dragdrop');
        this.dragdrop.disable();
        
        // Set mode.
        this.mode = 'view';
        
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
                this.getView().addRowCls(annotation.getModel(), this.getView().overItemCls);
            });
        
        eventDispatcher.bind('unhover', this,
            function(event, annotations, annotation)
            {
                this.getView().removeRowCls(annotation.getModel(), this.getView().overItemCls);
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
        
        // Adds a CSS class if it does not yet exist, otherwise does nothing.
        var addCSSclass = function(className, classRule)
        {
            var rules = document.styleSheets[0].cssRules || document.styleSheets[0].rules;
            for (var i = 0; i < rules.length; i++)
            {
                if (rules[i].selectorText == '.' + className)
                {
                    return;
                }
            }
            if (document.all)
            {
                document.styleSheets[0].addRule("." + className, classRule)
            }
            else if (document.getElementById)
            {
                document.styleSheets[0].insertRule("." + className + " { " + classRule + " }", 0);
            }
        };
        
        var colorClass = function(model) // TODO: optimize by means of caching.
        {
            var color = _this.annotations.getAnnotationColor(
                _this.annotations.getAnnotationByModel(model)
            );
            var cls = 'color-' + color.substr(1) + '-bg';
            color = brighten(color, 0.8);
            addCSSclass(cls, 'background-color: ' + color + ' !important;');
            return cls;
        }
        
        // Set language column.
        var languageColumn = {
            dataIndex: this.language,
            renderer: function(data, metadata, model)
            {
                metadata.tdCls = colorClass(model);
                var text = model.get('annotationInfo')[_this.language] || '';
                return _this.renderLanguage(text, metadata);
            },
            flex: 1
        };
        
        var editButtonColumn = {
            dataIndex: 'annotationId',
            align: 'right',
            renderer: function(annotationId, metadata, model)
            {
                // Get component id.
                var id = 'button_' + Ext.id();
                
                metadata.tdCls = colorClass(model);
                
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
                                        annotation: model,
                                        annotations: _this.annotations
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
            return [languageColumn, editButtonColumn];
        }
        else
        {
            return [languageColumn];
        }
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
    }
});

