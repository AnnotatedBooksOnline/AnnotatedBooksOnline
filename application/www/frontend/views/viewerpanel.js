/*
 * Viewer panel.
 *
 * Viewer panel owns:
 * - Viewport panel
 * - Information panel
 * - Workspace panel
 * - A book
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
        
        var westRegion = {
            collapsible: true,
            resizable: {
                handles: 'e'
            },
            region: 'west',
            title: 'Information',
            layout: {
                type: 'accordion',
                multi: 'true'
            },
            width: 190,
            minWidth: 190,
            items: [{
                xtype: 'informationpanel',
                title: 'Book information',
                collapsed: false,
                maxHeight: 200
            },{
                xtype: 'navigationpanel',
                cls: 'navigation-panel',
                collapsed: false,
                book: _this.book
            }]
        };
        
        var centerRegion = {
            region: 'center',
            xtype: 'viewportpanel',
            document: _this.book.getDocument(0),
            cls: 'viewport-panel',
            tbar: [{
                xtype: 'slider',
                hideLabel: true,
                useTips: false,
                x: 20,
                y: 20,
                width: 214,
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
                listeners: {
                    click: function()
                    {
                        _this.gotoPage(_this.getPage() - 1);
                    }
                }
            }, '-', 'Page', {
                xtype: 'textfield',
                width: 30,
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
                listeners: {
                    click: function()
                    {
                        _this.gotoPage(_this.getPageAmount() - 1);
                    }
                }
            }, '-', {
                iconCls: 'refresh-icon',
                tooltip: 'Reset viewer',
                listeners: {
                    click: function()
                    {
                        _this.resetViewport();
                    }
                }
            },{
                iconCls: 'settings-icon',
                tooltip: 'Set viewer settings',
                listeners: {
                    click: function() { Ext.ux.ViewerPanel.showSettingsWindow(); }
                }
            }, '-', {
                iconCls: 'save-icon',
                tooltip: 'Save this page as PDF',
                listeners: {
                    click: function()
                    {
                        _this.exportPdf();
                    }
                }
            }, '->', {
                iconCls: 'drag-icon',
                tooltip: 'Drag',
                enableToggle: true,
                allowDepress: false,
                pressed: true,
                name: 'drag-tool',
                listeners: {
                    toggle: function()
                    {
                        _this.setTool('drag');
                    }
                }
            },{
                iconCls: 'polygon-icon',
                tooltip: 'Add a polygon annotation',
                enableToggle: true,
                allowDepress: false,
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
                name: 'rectangle-tool',
                listeners: {
                    toggle: function()
                    {
                        _this.setTool('rectangle');
                    }
                }
            },{
                iconCls: 'erase-icon',
                tooltip: 'Erase an annotation',
                enableToggle: true,
                allowDepress: false,
                name: 'erase-tool',
                listeners: {
                    toggle: function()
                    {
                        _this.setTool('erase');
                    }
                }
            }]
        };
        
        var eastRegion = {
            region: 'east',
            xtype: 'workspacepanel',
            resizable: {
                handles: 'w'
            },
            collapsible: true,
            collapsed: false,
            width: 300,
            minWidth: 300
        };
        
        var defConfig = {
            layout: {
                type: 'border'
            },
            items: [westRegion, centerRegion, eastRegion],
            page: 0
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.information   = this.down('navigationpanel');
        this.workspace     = this.down('workspacepanel');
        this.viewportPanel = this.down('viewportpanel');
        this.viewport      = this.viewportPanel.getViewport();
        this.slider        = this.viewportPanel.dockedItems.get(0).items.get(0);
        
        this.annotations = new AnnotationOverlay(this.viewport);
        this.viewport.addOverlay(this.annotations);
        
        this.pageNumber = 0;
        
        this.tool = 'drag';
        
        var eventDispatcher = this.viewport.getEventDispatcher();
        eventDispatcher.bind('change', this, this.afterViewportChange);
    },
    
    afterViewportChange: function(event)
    {
        var sliderWidth = Math.round(
            this.viewport.getZoomLevel() / this.viewport.getMaxZoomLevel() * 200
        );
        
        this.skipSliderOnChange = true;
        this.slider.setValue(sliderWidth, false);
        this.skipSliderOnChange = false;
    },
    
    /*
     * Public methods.
     */
    
    exportPdf: function()
    {
        // Get scan id.
        var scanId = this.book.getScan(this.pageNumber).get('scanId');
        
        RequestManager.getInstance().request(
            'Pdf',
            'generate',
            {scan: scanId},
            this,
            function(data)
            {
                // Download just generated file.
                window.location = '?controller=Pdf&action=download&scan=' + scanId;
            }
        );
    },
    
    resetViewport: function()
    {
        this.viewport.reset();
    },
    
    /*
    setBook: function(book)
    {
        this.book = book;
        
        this.gotoPage(0);
        
        // TODO: Set total pages, destroy old book, some more stuff.
    },
    */
    
    gotoPage: function(number)
    {
        // Constrain page number.
        number = Math.max(0, Math.min(this.book.getScanAmount(), number));
        
        // Set new page number.
        this.pageNumber = number;
        
        // Set viewport document.
        this.viewport.setDocument(this.book.getDocument(number));
        
        // Update menu.
        var isFirst = (number == 0);
        var isLast  = (number == this.book.getScanAmount() - 1);
        
        this.viewportPanel.down('[name=first-page]').setDisabled(isFirst);
        this.viewportPanel.down('[name=previous-page]').setDisabled(isFirst);
        this.viewportPanel.down('[name=page-number]').setValue(number + 1);
        this.viewportPanel.down('[name=next-page]').setDisabled(isLast);
        this.viewportPanel.down('[name=last-page]').setDisabled(isLast);
        
        // TODO: Should be the other way around, information panel should listen for changes.
        this.information.setPage(number);
    },
    
    getPage: function()
    {
        return this.pageNumber;
    },
    
    getPageAmount: function()
    {
        return this.book.getScanAmount();
    },
    
    setTool: function(tool)
    {
        // Set tool.
        this.tool = tool;
        
        // Set icon states.
        var tools = ['drag', 'polygon', 'rectangle', 'erase'];
        for (var i = tools.length - 1; i >= 0; --i)
        {
            this.down('[name=' + tools[i] + '-tool]').toggle(tools[i] === tool, true);
        }
        
        // Do tool actions.
        this.annotations.setMode((tool === 'drag') ? 'view' : tool);
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
