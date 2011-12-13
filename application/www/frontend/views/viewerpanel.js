/*
 * Viewer panel class.
 */

Ext.define('Ext.ux.ViewerSettingsForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.viewersettingsform',

    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            items: [/*{
                name: 'somexitingsetting',
                fieldLabel: 'Some exiting setting',
                minLength: 6
            },{
                name: 'anotherxitingsetting',
                fieldLabel: 'Another exiting setting',
                minLength: 8
            }*/
            {
                html: 'There are currently no configurable settings.'
            }],
            
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Save',
                width: 140,
                handler: function()
                {
                    var form = this.up('form').getForm();
                    
                    if (form.isValid())
                    {
                        Ext.Msg.alert('Submitted Values', form.getValues(true));
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.ViewerSettingsWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Viewer settings',
            layout: 'fit',
            width: 600,
            height: 400,
            closable: true,
            resizable: true,
            draggable: true,
            modal: true,
            border: true,
            items: [{
                xtype: 'viewersettingsform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.Viewer', {
    extend: 'Ext.Panel',
    alias: 'widget.viewerpanel',

    initComponent: function()
    {
        var _this = this;
        
        var westRegion = {
            region: 'west',
            xtype: 'navigationpanel',
            collapsible: true,
            width: 180,
            cls: 'navigation-panel',
            book: _this.book
        };
        
        var centerRegion = {
            region: 'center',
            xtype: 'viewportpanel',
            document: _this.book.getDocument(0),
            cls: 'viewport-panel',
            tbar: [
                {
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
                            _this.skipSettingSliderValue = true;
                            _this.viewport.zoom(value / 200 * _this.viewport.getMaxZoomLevel());
                        }
                    },
                    cls: 'zoom-slider'
                }, '-', {
                    iconCls: 'first-icon',
                    tooltip: 'Go to first page',
                    disabled: true,
                    listeners: {
                        click: function()
                        {
                            this.up('viewerpanel').setPage(0);
                            this.nextSibling('textfield').setValue(1);
                            this.setDisabled(true);
                            var b = this.nextSibling('button');
                            b.setDisabled(true);
                            b = b.nextSibling('button');
                            b.setDisabled(false);
                            b = b.nextSibling('button');
                            b.setDisabled(false);
                        }
                    }
                },{
                    iconCls: 'previous-icon',
                    tooltip: 'Go to previous page',
                    disabled: true,
                    listeners: {
                        click: function()
                        {
                            var page = this.up('viewerpanel').getPage();
                            if (page - 1 >= 0)
                            {
                                this.up('viewerpanel').setPage(page - 1);
                                this.nextSibling('textfield').setValue(page);
                            }
                            if (page - 1 <= 0)
                            {
                                this.setDisabled(true);
                                this.previousSibling('button').setDisabled(true);
                            }
                            var b = this.nextSibling('button');
                            b.setDisabled(false);
                            b = b.nextSibling('button');
                            b.setDisabled(false);
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
                    validator: function(value)
                    {
                        if (value <= _this.book.getScanAmount() && value >= 1)
                        {
                            return true;
                        }
                        return 'Enter a page between 1 and ' + _this.book.getScanAmount() + ' inclusive.';
                    },
                    listeners: {
                        blur: function()
                        {
                            var val = this.getValue();
                            if (val <= _this.book.getScanAmount() && val >= 1)
                            {
                                this.up('viewerpanel').setPage(val-1);
                            }
                        },
                        specialkey: function(field, e)
                        {
                            if (e.getKey() == e.ENTER)
                            {
                                field.fireEvent('blur');
                            }
                        }
                    }
                },{
                    xtype: 'tbtext',
                    text: 'of ' + _this.book.getScanAmount(),
                    cls: 'total-text'
                }, '-', {
                    iconCls: 'next-icon',
                    tooltip: 'Go to next page',
                    disabled: _this.book.getScanAmount() == 1,
                    listeners: {
                        click: function()
                        {
                            var pages = _this.book.getScanAmount();
                            var page = this.up('viewerpanel').getPage();
                            if (page + 1 < pages)
                            {
                                this.up('viewerpanel').setPage(page + 1);
                                this.previousSibling('textfield').setValue(page + 2);
                            }
                            if (page + 2 >= pages)
                            {
                                this.setDisabled(true);
                                this.nextSibling('button').setDisabled(true);
                            }
                            var b = this.previousSibling('button');
                            b.setDisabled(false);
                            b = b.previousSibling('button');
                            b.setDisabled(false);
                        }
                    }
                },{
                    iconCls: 'last-icon',
                    tooltip: 'Go to last page',
                    disabled: _this.book.getScanAmount() == 1,
                    listeners: {
                        click: function()
                        {
                            var pages = _this.book.getScanAmount();
                            this.up('viewerpanel').setPage(pages - 1);
                            this.previousSibling('textfield').setValue(pages);
                            this.setDisabled(true);
                            var b = this.previousSibling('button');
                            b.setDisabled(true);
                            b = b.previousSibling('button');
                            b.setDisabled(false);
                            b = b.previousSibling('button');
                            b.setDisabled(false);
                        }
                    }
                }, '-', {
                    iconCls: 'refresh-icon',
                    tooltip: 'Reset viewer',
                    listeners: {
                        click: function()
                        {
                            _this.viewport.reset();
                        }
                    }
                },{
                    iconCls: 'settings-icon',
                    tooltip: 'Set viewer settings',
                    listeners: {
                        click: function() { Ext.ux.Viewer.showSettingsWindow(); }
                    }
                }
            ]
        };
        
        var eastRegion = {
            region: 'east',
            title: 'Book information',
            xtype: 'informationpanel',
            collapsible: true,
            collapsed: true,
            width: 200
        };
        
        var defConfig = {
            layout: {
                type: 'border',
                padding: 5
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
        
        this.navigation = this.items.get(0);
        this.viewport   = this.items.get(1).getViewport();
        this.slider     = this.items.get(1).dockedItems.get(0).items.get(0);
        this.totalText  = this.items.get(1).dockedItems.get(0).items.get(4);
        
        var eventDispatcher = this.viewport.getEventDispatcher();
        eventDispatcher.bind('change', this, this.afterViewportChange);
    },
    
    afterViewportChange: function(event)
    {
        if (this.timer === undefined)
        {
            var _this = this;
            this.timer = setTimeout(
                function()
                {
                    _this.timer = undefined;
                    
                    var area = _this.viewport.getVisibleArea();
                    
                    var topLeft = {
                        x: Math.max(0, Math.min(151, Math.round(area.topLeft.x))),
                        y: Math.max(0, Math.min(225, Math.round(area.topLeft.y)))
                    };
                    var bottomRight = {
                        x: Math.min(151, Math.round(area.bottomRight.x)),
                        y: Math.min(225, Math.round(area.bottomRight.y))
                    };
                    
                    var test = document.getElementById("test");
                    
                    test.style.left   = topLeft.x + "px";
                    test.style.top    = topLeft.y + "px";
                    test.style.width  = (bottomRight.x - topLeft.x) + "px";
                    test.style.height = (bottomRight.y - topLeft.y) + "px";
                },
                10
            );
        }
        
        if (this.skipSettingSliderValue === true)
        {
            this.skipSettingSliderValue = false;
            return;
        }
        
        var sliderWidth = Math.round(
            this.viewport.getZoomLevel() / this.viewport.getMaxZoomLevel() * 200
        );
        this.slider.setValue(sliderWidth, false);
    },
    
    resetViewport: function()
    {
        this.viewport.reset();
    },
    
    setBook: function(book)
    {
        this.book = book;
        
        this.viewport.setDocument(book.getDocument(0));
        this.page = 0;
    },
    
    setPage: function(number)
    {
        this.down('navigationpanel').setPage(number);
        this.down('viewportpanel').setDocument(this.book.getDocument(number));
        this.page = number;
        var b = this.down('viewportpanel').down('button');
        var p = number == 0;
        var n = number == this.book.getScanAmount() - 1;
        b.setDisabled(p);
        b = b.nextSibling('button');
        b.setDisabled(p);
        b = b.nextSibling('textfield');
        b.setValue(number + 1);
        b = b.nextSibling('button');
        b.setDisabled(n);
        b = b.nextSibling('button');
        b.setDisabled(n);
    },
    
    getPage: function()
    {
        return this.page;
    },
    
    statics: {
        showSettingsWindow: function()
        {
            // Check if the settings window is not already shown.
            if (Ext.ux.Viewer.settingsWindow !== undefined)
            {
                Ext.WindowManager.bringToFront(Ext.ux.Viewer.settingsWindow);
                
                return;
            }
            
            // Register action.
            Application.getInstance().addHistoryAction('viewersettings');
            
            // Show login window.
            var _this = this;
            Ext.ux.Viewer.settingsWindow = new Ext.ux.ViewerSettingsWindow({
                    listeners: {
                        close: function() { Ext.ux.Viewer.settingsWindow = undefined; }
                    }
                });
            Ext.ux.Viewer.settingsWindow.show();
        }
    }
});
