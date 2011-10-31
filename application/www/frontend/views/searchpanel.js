/* * Search panel class. */
 
Ext.regModel('SearchParameter', {
    fields: [{
        type: 'string',
        name: 'abbreviation'
    },{
        type: 'string',
        name: 'description'
    }]
});

Ext.define('Ext.form.field.YearBetweenField', {
    extend: 'Ext.container.Container',
    alias: 'widget.yearbetweenfield',
    requires: ['*'],
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: {
                type: 'hbox'
            },
            defaults: {
                flex: 0,
                xtype: 'numberfield',
                allowDecimals: false,
                autoStripChars: true,
                labelSeparator: '',
                labelWidth: 'auto',
                style: 'margin-right: 5px;'
            },
            items: [{
                name: 'from',
                fieldLabel: 'Between'
            },{
                name: 'to',
                fieldLabel: 'and'
            }],
            
            getValue: function()
            {
                return { from: _this.down('[name=from]').getValue(), to: _this.down('[name=to]').getValue() };
            }
        };
        
        Ext.apply(this, defConfig);                this.callParent();
    }
});

Ext.define('Ext.form.field.SearchComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.searchcombobox',
    requires: ['*'], // TODO: specify
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            displayField: 'name',
            width: 250,
            store: Ext.create('Ext.data.Store', {
                    model: 'SearchParameter',
                    data: [{
                        abbreviation: 'select',
                        name: '-Select-'
                    },{
                        abbreviation: 'any',
                        name: 'Any'
                    },{
                        abbreviation: 'year',
                        name: 'Year of publication'
                    },{
                        abbreviation: 'title',
                        name: 'Title'
                    },{
                        abbreviation: 'author',
                        name: 'Author'
                    }]
                }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbreviation',
            forceSelection: true,
            listeners: {
                select: function(combo)
                {
                    this.ownerCt.remove(this.ownerCt.getComponent(1));
                    switch (combo.getValue())
                    {
                        case 'any':
                            this.ownerCt.add([{xtype: 'textfield', name: 'value'}]);
                            break;
                        case 'year':
                            this.ownerCt.add([{xtype: 'yearbetweenfield', name: 'value'}]);
                            break;
                        case 'title':
                            this.ownerCt.add([{xtype: 'textfield', name: 'value'}]);
                            break;
                        case 'author':
                            this.ownerCt.add([{xtype: 'textfield', name: 'value'}]);
                            break;
                        case 'select':
                            if (this.ownerCt.next('[xtype=searchfield]') != null)
                                this.up('[xtype=searchpanel]').remove(this.ownerCt);
                            break;
                    }
                    if (this.up('[xtype=searchpanel]') && this.up('[xtype=searchpanel]').getComponent(this.up('[xtype=searchpanel]').items.length-1).down('[name=type]').getValue() != 'select')
                    {
                        this.up('[xtype=searchpanel]').add([{xtype: 'searchfield'}]);
                    }
                }
            }
        };
        
        Ext.apply(this, defConfig);                this.callParent();
        
        this.setValue('select');
    }
});

Ext.define('Ext.ux.SearchField', {
    extend: 'Ext.container.Container',
    alias: 'widget.searchfield',
    requires: ['*'], // TODO: specify
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: {
                type: 'hbox'
            },
            defaults: {
                flex: 0,
                style: 'margin-right: 15px;',
                width: 500
            },
            items: [{
                xtype: 'searchcombobox',
                name: 'type'
            },{
                xtype: 'textfield',
                name: 'value',
                disabled: true
            }],
            
            getValue: function()
            {
                return { type: _this.down('[name=type]').getValue(), value: _this.down('[name=value]').getValue() };
            }
        }
        
        Ext.apply(this, defConfig);                this.callParent();
    }
});

Ext.define('Ext.ux.SearchPanel', {    extend: 'Ext.ux.FormBase',    alias: 'widget.searchpanel',    requires: ['*'], // TODO: specify        initComponent: function()     {        var _this = this;                var defConfig = {            items: [{                name: 'first',                xtype: 'searchfield',            }],                        buttons: [{                xtype: 'button',                formBind: true,                text: 'Update',                width: 140,                handler: function()                {                    var form = this.up('form').getForm();                    // TODO                    /*                     * Normally we would submit the form to the server here and handle the response...                     * form.submit({                     *     clientValidation: true,                     *     url: 'editprofile.php',                     *     success: function(form, action) {                     *        //...                     *     },                     *     failure: function(form, action) {                     *         //...                     *     }                     * });                     */                    if (form.isValid())                    {
                        var fields = [];
                        for (var i = 0; i < _this.items.length; ++i)
                        {
                            var val = _this.items.get(i).getValue();
                            if (val.type != "select")
                            {
                                fields[fields.length] = _this.items.get(i).getValue();
                            }
                        }
                                                Ext.Msg.alert('Submitted Values', Ext.JSON.encode(fields));                    }                }            }]        };                Ext.apply(this, defConfig);                this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select',firstField,{});    }});
