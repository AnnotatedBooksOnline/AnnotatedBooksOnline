/*
 * Viewer panel class.
 */

Ext.define('Ext.ux.ViewerSettingsForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.viewersettingsform',
    requires: ['*'], // TODO: specify

    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            items: [{
                name: 'somexitingsetting',
                fieldLabel: 'Some exiting setting',
                minLength: 6
            },{
                name: 'anotherxitingsetting',
                fieldLabel: 'Another exiting setting',
                minLength: 8
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
    extend: 'Ext.window.Window',

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
    requires: [], //TODO: border layout

    initComponent: function()
    {
        var westRegion = {
            region: 'west',
            xtype: 'navigationpanel',
            collapsible: true,
            split: true,
            width: 200,
            cls: 'navigation-panel'
        };
        
        var _this = this;
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
                    xtype: 'textfield',
                    width: 30,
                    value: '1',
                    maskReg: /\d+/,
                    stripCharsRe: /[^\d]+/,
                    allowNegative: false,
                    allowDecimals: false,
                    autoStripChars: true,
                    allowBlank: false
                },{
                    xtype: 'tbtext',
                    text: '/ ' + _this.book.getDocumentAmount(),
                    cls: 'total-text'
                },{
                    iconCls: 'first-icon',
                    tooltip: 'Go to first page',
                    disabled: true
                },{
                    iconCls: 'previous-icon',
                    tooltip: 'Go to previous page',
                    disabled: true
                },{
                    iconCls: 'next-icon',
                    tooltip: 'Go to next page',
                },{
                    iconCls: 'last-icon',
                    tooltip: 'Go to last page',
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
                        click: function() { _this.showSettingsWindow(); }
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
            split: true,
            width: 200
        };
        
        var defConfig = {
            layout: {
                type: 'border',
                padding: 5
            },
            items: [westRegion, centerRegion, eastRegion]
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
        eventDispatcher.bind('change', this.afterViewportChange, this);
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
    
    showSettingsWindow: function()
    {
        var window = new Ext.ux.ViewerSettingsWindow();
        window.show();
    },
    
    resetViewport: function()
    {
        this.viewport.reset();
    },
    
    setBook: function(book)
    {
        this.book = book;
        
        this.viewport.setDocument(book.getDocument(0));
    }
});
