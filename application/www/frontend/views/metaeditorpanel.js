var metaKeyTemplate = [
    'Page size',
    'Document type'
];

Ext.define('Ext.ux.MetaField', {
    extend: 'Ext.container.Container',
    alias: 'widget.metafield',
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'textfield',
                name: 'value',
                readOnly: true,
                flex: 5,
                fieldLabel: this.metaKey,
                allowBlank: true,
                style: 'margin-right: 5px;',
                value: this.metaValue,
                listeners: {
                    focus: function()
                    {
                        if (this.readOnly && !this.disabled)
                        {
                            var current = _this.ownerCt.down('metafield');
                            do
                            {
                                if (current != _this)
                                {
                                    current.setDisabled(true);
                                }
                            } while (current = current.nextNode('metafield'));
                            _this.setEditMode(true);
                        }
                    }
                }
            },{
                xtype: 'button',
                name: 'save',
                tooltip: 'Save',
                iconCls: 'accept-icon',
                width: 22,
                hidden: true,
                handler: function()
                {
                    var newValue = _this.down('[name=value]').getValue();
                    _this.saveFun(newValue, function()
                    {
                        var current = _this.ownerCt.down('metafield');
                        do
                        {
                            if (current != _this)
                            {
                                current.setDisabled(false);
                            }
                        } while (current = current.nextNode('metafield'));
                        _this.setEditMode(false);
                        _this.metaValue = newValue;
                    });
                }
            },{
                xtype: 'button',
                name: 'revert',
                tooltip: 'Cancel',
                iconCls: 'cancel-icon',
                width: 22,
                hidden: true,
                handler: function()
                {
                    _this.down('[name=value]').setValue(_this.metaValue);
                    var current = _this.ownerCt.down('metafield');
                    do
                    {
                        if (current != _this)
                        {
                            current.setDisabled(false);
                        }
                    } while (current = current.nextNode('metafield'));
                    _this.setEditMode(false);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
    },
    
    setEditMode: function(editMode)
    {
        this.down('[name=value]').setReadOnly(!editMode);
        this.down('[name=save]').setVisible(editMode);
        this.down('[name=revert]').setVisible(editMode);
    },
    
    setDisabled: function(disabled)
    {
        this.down('[name=value]').setDisabled(disabled);
    }
});


Ext.define('Ext.ux.MetaEditorPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.metaeditorpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            bodyPadding: 5,
            items: []
        };
        
        for (var i = 0; i < metaKeyTemplate.length; i++)
        {
            defConfig.items.push({
                xtype: 'metafield',
                metaKey: metaKeyTemplate[i],
                metaValue: _this.book.get('meta')[metaKeyTemplate[i]] || '',
                saveFun: function(value, succ, fail)
                {
                    var key = this.metaKey;
                    var fields = {
                        key: key,
                        value: value,
                        bookId: _this.book.get('bookId')
                    };
                    _this.setLoading(true);
                    RequestManager.getInstance().request('Book', 'setMeta', fields, _this,
                        function(data)
                        {
                            _this.setLoading(false);
                            if (succ && typeof succ === 'function')
                            {
                                succ();
                            }
                        },
                        function()
                        {
                            _this.setLoading(false);
                            if (fail && typeof fail === 'function')
                            {
                                return fail();
                            }
                            return true;
                        }
                    );
                }
            });
        }
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    storeMetaInModel: function()
    {
        var meta = this.book.get('meta');
        var current = this.down('metafield');
        do
        {
            meta[current.metaKey] = current.metaValue;
        } while (current = current.nextNode('metafield'));
        this.book.store.fireEvent('datachanged',this.book.store,{});
    }
});

Ext.define('Ext.ux.MetaEditorWindow', {
    extend: 'Ext.ux.WindowBase',
    alias: 'widget.metaeditorwindow',
    
    initComponent: function() 
    {   
        var defConfig = {
            title: 'Edit metadata',
            layout: 'fit',
            width: 600,
            height: 200,
            items: [{
                xtype: 'metaeditorpanel',
                border: false,
                book: this.book
            }],
            listeners: {
                beforeclose: function()
                {
                    this.down('metaeditorpanel').storeMetaInModel();
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

