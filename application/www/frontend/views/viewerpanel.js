/*
 * Viewer panel.
 *
 * Viewer panel owns:
 * - Viewport panel
 * - Information panel
 * - Workspace panel
 * - A binding
 * - A page number
 * 
 * Each of which knows of the viewer panel, and can rely on its existance.
 */

Ext.define('Ext.ux.ViewerPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.viewerpanel',
    
    /*
     * Private methods.
     */
    
    initComponent: function()
    {
        var _this = this;
        
        var centerRegion = {
            region: 'center',
            xtype: 'viewportpanel',
            document: _this.binding.getDocument(0),
            cls: 'viewport-panel',
            dockedItems: {
                xtype: 'toolbar',
                dock: 'top',
                enableOverflow: true,
                items: [{
                    xtype: 'slider',
                    name: 'zoom-slider',
                    hideLabel: true,
                    useTips: false,
                    x: 20,
                    y: 20,
                    width: 150,
                    minValue: 0,
                    maxValue: 200,
                    listeners: {
                        change: function(slider, value)
                        {
                            if (_this.skipSliderOnChange === true)
                            {
                                _this.skipSliderOnChange = false;
                                return;
                            }
                            
                            _this.viewport.zoom(value / 200 * _this.viewport.getMaxZoomLevel(),
                                undefined, false);
                        }
                    },
                    cls: 'zoom-slider'
                }, '-', {
                    iconCls: 'first-icon',
                    tooltip: 'Go to first page',
                    disabled: true,
                    name: 'first-page',
                    overflowText: 'Go to first page',
                    listeners: {
                        click: function()
                        {
                            _this.gotoPage(0);
                        }
                    }
                },{
                    iconCls: 'previous-icon',
                    tooltip: 'Go to previous page',
                    disabled: true,
                    name: 'previous-page',
                    overflowText: 'Go to previous page',
                    listeners: {
                        click: function()
                        {
                            _this.gotoPage(_this.getPage() - 1);
                        }
                    }
                }, '-', 'Page', {
                    xtype: 'textfield',
                    width: 40,
                    value: '1',
                    maskReg: /\d+/,
                    stripCharsRe: /[^\d]+/,
                    allowNegative: false,
                    allowDecimals: false,
                    autoStripChars: true,
                    name: 'page-number',
                    validator: function(value)
                    {
                        if ((value <= _this.getPageAmount()) && (value >= 1))
                        {
                            return true;
                        }
                        
                        return 'Enter a page between 1 and ' + _this.getPageAmount() + ' inclusive.';
                    },
                    listeners: {
                        blur: function()
                        {
                            var value = this.getValue();
                            if ((value <= _this.getPageAmount()) && (value >= 1))
                            {
                                _this.gotoPage(value - 1);
                            }
                        },
                        specialkey: function(field, event)
                        {
                            if (event.getKey() == event.ENTER)
                            {
                                field.fireEvent('blur');
                            }
                        }
                    }
                },{
                    xtype: 'tbtext',
                    text: 'of ' + _this.getPageAmount(),
                    name: 'total-pages'
                }, '-', {
                    iconCls: 'next-icon',
                    tooltip: 'Go to next page',
                    disabled: (_this.getPageAmount() == 1),
                    name: 'next-page',
                    overflowText: 'Go to next page',
                    listeners: {
                        click: function()
                        {
                            _this.gotoPage(_this.getPage() + 1);
                        }
                    }
                },{
                    iconCls: 'last-icon',
                    tooltip: 'Go to last page',
                    disabled: (_this.getPageAmount() == 1),
                    name: 'last-page',
                    overflowText: 'Go to last page',
                    listeners: {
                        click: function()
                        {
                            _this.gotoPage(_this.getPageAmount() - 1);
                        }
                    }
                }, '-', {
                    iconCls: 'refresh-icon',
                    tooltip: 'Reset viewer',
                    overflowText: 'Reset viewer',
                    listeners: {
                        click: function()
                        {
                            _this.resetViewport();
                        }
                    }
                }, {
                    iconCls: 'rotate-left-icon',
                    tooltip: 'Rotate left',
                    overflowText: 'Rotate left',
                    name: 'rotate-left',
                    listeners: {
                        click: function()
                        {
                            _this.rotateLeft();
                        }
                    }
                }, {
                    iconCls: 'rotate-right-icon',
                    tooltip: 'Rotate right',
                    overflowText: 'Rotate right',
                    name: 'rotate-right',
                    listeners: {
                        click: function()
                        {
                            _this.rotateRight();
                        }
                    }
                }, '-', {
                    iconCls: 'annotation-colors-icon',
                    tooltip: 'Show annotation colors',
                    overflowText: 'Show annotation colors',
                    name: 'annotation-colors',
                    enableToggle: true,
                    pressed: true,
                    listeners: {
                        toggle: function()
                        {
                            _this.updateAnnotationColors();
                        }
                    }
                }, '->', {
                    iconCls: 'drag-icon',
                    tooltip: 'Drag',
                    enableToggle: true,
                    allowDepress: false,
                    pressed: true,
                    overflowText: 'Drag',
                    name: 'view-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('view');
                        }
                    }
                },{
                    iconCls: 'polygon-icon',
                    tooltip: 'Add a polygon annotation',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Add a polygon annotation',
                    name: 'polygon-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('polygon');
                        }
                    }
                },{
                    iconCls: 'rectangle-icon',
                    tooltip: 'Add a rectangle annotation',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Add a rectangle annotation',
                    name: 'rectangle-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('rectangle');
                        }
                    }
                },{
                    iconCls: 'vertex-icon',
                    tooltip: 'Move a vertex',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Move a vertex',
                    name: 'vertex-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('vertex');
                        }
                    }
                },{
                    iconCls: 'add-vertex-icon',
                    tooltip: 'Add a vertex',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Add a vertex',
                    name: 'addvertex-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('addvertex');
                        }
                    }
                },{
                    iconCls: 'erase-vertex-icon',
                    tooltip: 'Erase a vertex',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Erase a vertex',
                    name: 'erasevertex-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('erasevertex');
                        }
                    }
                },{
                    iconCls: 'erase-icon',
                    tooltip: 'Erase an annotation',
                    enableToggle: true,
                    allowDepress: false,
                    overflowText: 'Erase an annotation',
                    name: 'erase-tool',
                    listeners: {
                        toggle: function()
                        {
                            _this.setTool('erase');
                        }
                    }
                }]
            }
        };
        
        var westRegion = {
            region: 'west',
            name: 'west-region',
            split: true,
            collapsible: true,
            width: 200,
            minWidth: 200,
            layout: 'fit',
            title: 'Information'
        };
        
        var eastRegion = {
            region: 'east',
            name: 'east-region',
            split: true,
            collapsible: true,
            collapsed: false,
            width: 300,
            minWidth: 300,
            layout: 'fit',
            title: 'Workspace'
        };
        
        var defConfig = {
            layout: 'border',
            title: escape(_this.binding.getModel().get('signature')),
            items: [westRegion, centerRegion, eastRegion]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        // Set members.
        this.eventDispatcher = new EventDispatcher();
        this.tool            = 'view';
        this.toolsVisible    = false;
        
        // Set tool visibility.
        this.setToolsVisibility();
        
        // Set page number.
        if (!this.pageNumber)
        {
            this.pageNumber = 0;
        }
        
        // Constrain page number.
        this.pageNumber = Math.max(0, Math.min(this.binding.getScanAmount(), this.pageNumber));
        
        // Render childs.
        this.callParent();
        
        // Fetch shortcuts to components.
        this.viewportPanel = this.down('viewportpanel');
        this.viewport      = this.viewportPanel.getViewport();
        this.slider        = this.viewportPanel.down('[name=zoom-slider]');
        
        // Create annotations.
        this.annotations = new Annotations(this);
        
        // Watch for mode changes.
        this.annotations.getEventDispatcher().bind('modechange', this,
            function(event, annotations, mode)
            {
                this.setTool(mode);
            });
        
        // Watch for change events on viewport.
        var eventDispatcher = this.viewport.getEventDispatcher();
        eventDispatcher.bind('change', this, this.afterViewportChange);
        
        // Handle authentication changes.
        Authentication.getInstance().getEventDispatcher().bind('modelchange', this, this.onAuthenticationChange);
        
        // Add information (west) and workspace (east) regions, as they rely on the data above.
        this.down('[name=west-region]').add({
            xtype: 'informationpanel',
            viewer: this
        });
        
        this.down('[name=east-region]').add({
            xtype: 'workspacepanel',
            viewer: this
        });
        
        // Get them.
        this.information = this.down('navigationpanel');
        this.workspace   = this.down('workspacepanel');
        
        // Change tab title on page change.
        this.getEventDispatcher().bind('pagechange', this, this.changeTabTitle);
        
        var store = this.annotations.getStore();
        store.on('load', function()
        {
            this.updateAnnotationColors();
        }, this);
        store.on('add', function()
        {
            this.updateAnnotationColors();
        }, this);
        
        // Finally, we can go to the indicated page.
        this.gotoPage(this.pageNumber);
    },
    
    destroy: function()
    {
        // Unsubscribe from authentication changes.
        Authentication.getInstance().getEventDispatcher().unbind('modelchange', this, this.onAuthenticationChange);
        
        // Destroy annotations.
        this.annotations.destroy();
        
        // Destroy binding.
        this.binding.destroy();
        
        this.callParent();
    },
    
    afterViewportChange: function(event)
    {
        // Check for current timer.
        if (this.timer !== undefined)
        {
            return;
        }
        
        // Set timer to avoid updating to many times.
        var _this = this;
        this.timer = setTimeout(
            function()
            {
                // Clear timer.
                _this.timer = undefined;
                
                // Calculate slider width.
                var sliderWidth = Math.round(
                    _this.viewport.getZoomLevel() / _this.viewport.getMaxZoomLevel() * 200
                );
                
                // Check difference.
                var difference = Math.abs(_this.slider.getValue() - sliderWidth);
                if (difference >= 2)
                {
                    _this.skipSliderOnChange = true;
                    _this.slider.setValue(sliderWidth, false);
                    _this.skipSliderOnChange = false;
                }
            },
            10
        );
    },
    
    onAuthenticationChange: function()
    {
        // Set tools visibility.
        this.setToolsVisibility();
    },
    
    setToolsVisibility: function()
    {
        // Check whether tools are visible.
        var permission = Authentication.getInstance().hasPermissionTo('add-annotations');
        var visible    = this.toolsVisible && permission;
        
        // Set icon states.
        var tools = ['view', 'polygon', 'rectangle', 'vertex', 'addvertex', 'erasevertex', 'erase'];
        for (var i = tools.length - 1; i >= 0; --i)
        {
            var toolButton = this.down('[name=' + tools[i] + '-tool]');
            
            if (visible)
            {
                toolButton.show();
            }
            else
            {
                toolButton.hide();
            }
        }
        
        // Disable these tools when using an older version of Internet Explorer
        // as we haven't been able to get these to work correctly.
        // This can be removed when these tools work properly in these browsers.
        if($.browser.msie && ($.browser.version < 9))
        {
            this.down('[name=rectangle-tool]').setDisabledNoMask(true);
            this.down('[name=vertex-tool]').setDisabledNoMask(true);
            this.down('[name=addvertex-tool]').setDisabledNoMask(true);
            this.down('[name=erasevertex-tool]').setDisabledNoMask(true);
        }
        
        // Set view tool if tools are not visible.
        if (!visible && (this.tool !== 'view'))
        {
            this.setTool('view');
        }
    },
    
    updateAnnotationColors: function()
    {
        var show = this.down('[name=annotation-colors]').pressed;
        var overlays = this.viewport.overlays;
        for (var i = 0; i < overlays.length; i++)
        {
            overlays[i].setInvertHighlight(show);
        }
    },
    
    /*
     * Public methods.
     */
    
    getBinding: function()
    {
        return this.binding;
    },
    
    getAnnotations: function()
    {
        return this.annotations;
    },
    
    getEventDispatcher: function()
    {
        return this.eventDispatcher;
    },
    
    getViewportEventDispatcher: function()
    {
        return this.viewport.getEventDispatcher();
    },
    
    // Gets viewer its viewport. A viewer only ever has one.
    getViewport: function()
    {
        return this.viewport;
    },
    
    getPage: function()
    {
        return this.pageNumber;
    },
    
    // Gets current book.
    getBook: function()
    {
        var page = this.pageNumber + 1;
        
        var currentBook;
        this.binding.getModel().books().each(
            function(book)
            {
                var firstPage = book.get('firstPage');
                var lastPage  = book.get('lastPage');
                
                if ((firstPage <= page) && (page <= lastPage))
                {
                    currentBook = book;
                    
                    return false;
                }
            });
        
        return currentBook;
    },
    
    getScanId: function()
    {
        return this.binding.getScanId(this.pageNumber);
    },
    
    getPageAmount: function()
    {
        return this.binding.getScanAmount();
    },
    
    // Resets viewport.
    resetViewport: function()
    {
        this.viewport.reset();
    },
    
    rotateLeft: function()
    {
        // Fetch rotation, and round it to the previous quarter-pi.
        var quarterPi       = 0.25 * Math.PI;
        var currentRotation = this.viewport.getRotation();
        var newRotation     = Math.round(currentRotation / quarterPi - 1) * quarterPi;
        
        // Rotate viewport by a delta rotation.
        this.viewport.rotate(newRotation - currentRotation);
    },
    
    rotateRight: function()
    {
        // Fetch rotation, and round it to the next quarter-pi.
        var quarterPi        = 0.25 * Math.PI;
        var currentRotation = this.viewport.getRotation();
        var newRotation     = Math.round(currentRotation / quarterPi + 1) * quarterPi;
        
        // Rotate viewport by a delta rotation.
        this.viewport.rotate(newRotation - currentRotation);
    },
    
    gotoPage: function(number)
    {
        // Constrain page number.
        number = Math.max(0, Math.min(this.binding.getScanAmount(), number));
        
        // Set new page number.
        this.pageNumber = number;
        
        // Set viewport document.
        var document = this.binding.getDocument(number);
        this.viewport.setDocument(document);
        
        // Update menu.
        var isFirst = (number === 0);
        var isLast  = (number === (this.binding.getScanAmount() - 1));
        
        this.viewportPanel.down('[name=first-page]').setDisabled(isFirst);
        this.viewportPanel.down('[name=previous-page]').setDisabled(isFirst);
        this.viewportPanel.down('[name=page-number]').setValue(number + 1);
        this.viewportPanel.down('[name=next-page]').setDisabled(isLast);
        this.viewportPanel.down('[name=last-page]').setDisabled(isLast);
        
        var noRotate = !document.supportsRotation();
        this.viewportPanel.down('[name=rotate-left]').setDisabledNoMask(noRotate);
        this.viewportPanel.down('[name=rotate-right]').setDisabledNoMask(noRotate);
        
        // Trigger event.
        this.eventDispatcher.trigger('pagechange', this, number);
    },
    
    changeTabTitle: function()
    {
        var bindingModel = this.getBinding().getModel();
        
        // Set book field label and value.
        var book = this.getBook();
        
        // Set default tab title (binding uniqueness constraint)
        var tabTitle = 'Binding: '
                     + escape(bindingModel.get('signature')) + ', '
                     + escape(bindingModel.get('library').libraryName); 
        
        if (book !== undefined)
        {
            tabTitle = 'Book: ' + escape(book.get('title'));
        }
        
        // Update tab title, but not too long.
        if (tabTitle.length > 47) 
        {
            tabTitle = tabTitle.substring(0, 46) + '...';
        }
        
        this.up('.tabpanel').getActiveTab().tab.setText(tabTitle);
    },
    
    setTool: function(tool)
    {
        // Set tool.
        this.tool = tool;
        
        // Set icon states.
        var tools = ['view', 'polygon', 'rectangle', 'vertex', 'addvertex', 'erasevertex', 'erase'];
        for (var i = tools.length - 1; i >= 0; --i)
        {
            this.down('[name=' + tools[i] + '-tool]').toggle(tools[i] === tool, true);
        }
        
        // Do tool actions.
        this.annotations.setMode(tool);
    },
    
    showTools: function()
    {
        this.toolsVisible = true;
        
        this.setToolsVisibility();
    },
    
    hideTools: function()
    {
        this.toolsVisible = false;
        
        this.setToolsVisibility();
    },
    
    reload: function()
    {
        Application.getInstance().openTab(
            'binding', 
            [this.binding.getModel().get('bindingId'), this.pageNumber + 1], 
            true);
        this.close();
    },
    
    statics: {
        showSettingsWindow: function()
        {
            // Check if the settings window is not already shown.
            if (Ext.ux.ViewerPanel.settingsWindow !== undefined)
            {
                Ext.WindowManager.bringToFront(Ext.ux.ViewerPanel.settingsWindow);
                
                return;
            }
            
            // Register action.
            Application.getInstance().addHistoryAction('viewersettings');
            
            // Show login window.
            var _this = this;
            Ext.ux.ViewerPanel.settingsWindow = new Ext.ux.ViewerSettingsWindow({
                    listeners: {
                        close: function() { Ext.ux.ViewerPanel.settingsWindow = undefined; }
                    }
                });
            Ext.ux.ViewerPanel.settingsWindow.show();
        }
    }
});
