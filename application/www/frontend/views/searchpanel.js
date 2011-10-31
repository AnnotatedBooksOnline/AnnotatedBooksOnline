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
                style: 'margin-right: 5px;',
                allowBlank: true
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
                width: 500,
                allowBlank: true
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

Ext.define('Ext.ux.SearchPanel', {    extend: 'Ext.ux.FormBase',    alias: 'widget.searchpanel',    requires: ['*'], // TODO: specify        initComponent: function()     {        var _this = this;                var defConfig = {            items: [{                xtype: 'searchfield'            }],                        buttons: [{                xtype: 'button',                formBind: true,                text: 'Search',                width: 140,                handler: function()                {                    var form = this.up('form').getForm();                    // TODO                    /*                     * Normally we would submit the form to the server here and handle the response...                     * form.submit({                     *     clientValidation: true,                     *     url: 'editprofile.php',                     *     success: function(form, action) {                     *        //...                     *     },                     *     failure: function(form, action) {                     *         //...                     *     }                     * });                     */                    if (form.isValid())                    {
                        var fields = [];
                        for (var i = 0; i < _this.items.length; ++i)
                        {
                            var val = _this.items.get(i).getValue();
                            if (val.type != "select")
                            {
                                fields[fields.length] = _this.items.get(i).getValue();
                            }
                        }
                                                Ext.Msg.alert('Submitted Values', Ext.JSON.encode(fields));                    }                }
            }]        };                Ext.apply(this, defConfig);                this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select',firstField,{});    }});






Ext.define('SP.Search.SearchColumnModel', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'name',
        type: 'string'
    },{
        name: 'desc',
        type: 'string'
    },{
        name: 'show',
        type: 'boolean'
    }]
});

var columns = Ext.create('Ext.data.Store', {
    model: 'SP.Search.SearchColumnModel',
/*        proxy: {
        type: 'ajax',
        url: 'search.php',
        reader: {
            type: 'json',
            root: 'columns'
        }
    }*/
    data: [{
        name: 'name',
        desc: 'Name',
        show: true
    },{
        name: 'desc',
        desc: 'Description',
        show: true
    },{
        name: 'thumbnail',
        desc: 'Thumbnail',
        show: false
    }]
});



var store = Ext.create('Ext.data.Store', {
    model: Ext.define('CurrentColumnModel', {
        extend: 'Ext.data.Model',
        fields: function()
        {
            var cols = columns.getRange();
            var fields = [];
            for (var i = 0; i < cols.length; i++)
            {
                fields[fields.length] = {name: cols[i].get('name')};
            }
            return fields;
        }()
    }),
/*        proxy: {
        type: 'ajax',
        url: 'search.php',
        reader: {
            type: 'json',
            root: 'books'
        }
    }*/
    data: [{
        name: 'bla',
        desc: 'Blaat',
        thumbnail: 'http://dev.sencha.com/deploy/ext-4.0.0/examples/datasets/touch-icons/forms.png'
    },{
        name: 'test',
        desc: 'Dit is een test',
        thumbnail: 'http://dev.sencha.com/deploy/ext-4.0.0/examples/datasets/touch-icons/kiva.png'
    }]
});
//    store.load();

Ext.define('SP.Search.ResultSet', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresultset',

    initComponent: function() {
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<div>',
                        '<div style="float: left">',
                            '<img src="{thumbnail}" style="width: 50px; height: 67px;"/>',
                        '</div>',
                        '<div style="float: left">',
                            '<table>{properties}</table>',
                        '</div>',
                    '</div>',
                    '<div style="clear: both"/>',
                '</tpl>',
            ],
            autoWidth: true,
            disableSelection: true,
//            trackOver: true,
//            overItemCls: 'x-item-over',
//            itemSelector: 'div.thumb-wrap',
            emptyText: 'No books found.',
            prepareData: function(data) {
                var properties = "";
                for (var field in data)
                {
                    var col = columns.findRecord('name', field);
                    if (col != undefined && col.get('desc') != undefined && col.get('show'))
                    {
                        properties += '<tr><td>' + col.get('desc') + ': </td><td>' + data[field] + '</td></tr>';
                    }
                }
                data['properties'] = properties;
                return data;
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    }
});

Ext.define('Ext.ux.SearchResultView', {
    extend: 'Ext.Panel',
    alias: 'widget.searchresults',
    requires: ['*'],
    
    initComponent: function() {
        var defConfig = {
            title: 'Search results',
            id: 'bla',
//            border: 0,
            autoWidth: true,
            items: [{
                xtype: 'searchresultset',
                store: store
            }]
        };
        
        Ext.apply(this, defConfig);                this.callParent();
    }
});
