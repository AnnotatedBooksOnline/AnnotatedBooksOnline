var metaKeySimple = [
    'Metadata',
    ['Author / Title', 'double'],
    ['Script', 'double'],
    ['Hands', 'double'],
    ['Place', 'double'],
    ['Date', 'double'],
    ['Physical state', 'double'],
    ['Material', 'double'],
    ['Provenance', 'double']
];

var metaKeyAdditional = [
    'Additional information',
    ['Number of leaves', 'simple'],
    ['Measurements folio (height x width)', 'simple'],
    ['Measurements text area', 'simple'],
    ['Number of columns', 'simple'],
    ['Number of lines', 'simple'],
    ['Ruling practice & prickings', 'simple'],
    ['Foliation and catchwords', 'simple'],
    ['Highlighting and initials', 'simple'],
    ['Penwork and decoration', 'simple'],
    ['Later additions', 'simple'],
    ['Incipit / Explicit', 'simple'],
    ['Edition of the text', 'simple'],
    ['Genre', 'simple'],
    ['Previous literature', 'simple'],
    ['Bibliography', 'simple'],
    'Additional comments',
    ['Additional comments', 'comment']
];

var metaKeySub = [
    ['Part', 'simple']
];

var metaKeyTemplate = metaKeySimple.concat(metaKeyAdditional);
var metaKeySubTemplate = metaKeySub.concat(metaKeySimple);

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
            items: [
            {
                xtype: 'container',
                layout: 'anchor',
                flex: 5,
                style: 'margin-right: 5px; margin-bottom: 5px',
                items: [{
                    anchor: '100%',
                    xtype: 'textfield',
                    name: 'value',
                    readOnly: true,
                    hidden: this.metaType == 'comment',
                    fieldLabel: this.metaKey,
                    allowBlank: true,
                    value: this.metaValue.value,
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
                    anchor: '100%',
                    xtype: 'textarea',
                    name: 'comment',
                    readOnly: true,
                    hidden: this.metaType == 'simple',
                    fieldLabel: '<i>Comments</i>',
                    allowBlank: true,
                    value: this.metaValue.comment,
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
                }]
            },{
                xtype: 'button',
                name: 'save',
                tooltip: 'Save',
                iconCls: 'accept-icon',
                width: 22,
                hidden: true,
                handler: function()
                {
                    var newValue = {
                        value: _this.down('[name=value]').getValue(),
                        comment: _this.down('[name=comment]').getValue()
                    };
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
                    _this.down('[name=value]').setValue(_this.metaValue.value);
                    _this.down('[name=comment]').setValue(_this.metaValue.comment);
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
        this.down('[name=comment]').setReadOnly(!editMode);
        this.down('[name=save]').setVisible(editMode);
        this.down('[name=revert]').setVisible(editMode);
    },
    
    setDisabled: function(disabled)
    {
        this.down('[name=value]').setDisabled(disabled);
        this.down('[name=comment]').setDisabled(disabled);
    },
    
    afterRender: function()
    {
        this.callParent();
        this.doLayout();
    }
});

Ext.define('Ext.ux.MetaEditorPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.metaeditorpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            bodyPadding: 5,
            items: []
        };
        
        var template = this.fragment.fragmentId == -1 ? metaKeyTemplate : metaKeySubTemplate;
        
        for (var i = 0; i < template.length; i++)
        {
            if (template[i] instanceof Array)
            {
                var val = _this.metadata[template[i][0]] || {};
                defConfig.items.push({
                    xtype: 'metafield',
                    metaKey: template[i][0],
                    metaValue: val,
                    metaType: template[i][1],
                    saveFun: function(value, succ, fail)
                    {
                        var key = this.metaKey;
                        var fields = {
                            key: key,
                            value: value,
                            fragment: _this.fragment
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
            else if (typeof template[i] == "string")
            {
                defConfig.items.push({
                    xtype: 'panel',
                    border: false,
                    html: '<h2 style="border-bottom: 1px solid #AAA">' + template[i] + '</h2>',
                    style: 'margin-top: 10px',
                    height: 20
                });
            }
        }
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    storeMetaInModel: function()
    {
        var meta = this.metadata;
        var current = this.down('metafield');
        do
        {
            meta[current.metaKey] = current.metaValue;
        } while (current = current.nextNode('metafield'));
        this.storeTrigger();
    }
});

Ext.define('Ext.ux.MetaEditorWindow', {
    extend: 'Ext.ux.WindowBase',
    alias: 'widget.metaeditorwindow',
    
    initComponent: function() 
    {   
        var _this = this;
        
        if (!_this.book.get('meta')[this.fragmentId])
        {
            _this.book.get('meta')[this.fragmentId] = {};
        }
        
        var meta = _this.book.get('meta')[this.fragmentId];
        
        var title = this.fragmentId == -1
                  ? _this.book.get('title')
                  : _this.book.get('title') + ', part ' + ((meta['Part'] || {}).value || '[unknown]');
        
        var defConfig = {
            title: 'Edit metadata for ' + title,
            layout: 'fit',
            width: 600,
            height: 400,
            items: [{
                xtype: 'metaeditorpanel',
                border: false,
                autoScroll: true,
                metadata: _this.book.get('meta')[this.fragmentId],
                storeTrigger: function()
                {
                    _this.book.store.fireEvent('datachanged',_this.book.store,{});
                },
                fragment: { bookId: _this.book.get('bookId'), fragmentId: this.fragmentId }
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

