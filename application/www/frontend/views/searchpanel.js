/*
 * Search panel class.
 */

var bookProperties = [{
    abbreviation: 'year',
    name: 'Year of publication'
},{
    abbreviation: 'title',
    name: 'Title'
},{
    abbreviation: 'author',
    name: 'Author'
},{
    abbreviation: 'place',
    name: 'Place published'
},{
    abbreviation: 'publisher',
    name: 'Publisher'
},{
    abbreviation: 'version',
    name: 'Version'
},{
    abbreviation: 'language',
    name: 'Language'
},{
    abbreviation: 'library',
    name: 'Library'
},{
    abbreviation: 'signature',
    name: 'Signature'
},{
    abbreviation: 'provenance', // TODO: I really do not know how to make this a valid search variable. Added it anyhow. -- Bert
    name: 'Provenance'
},{
    abbreviation: 'annotlanguage',
    name: 'Language of annotations'
},{
    abbreviation: 'summary',
    name: 'Summary'
}];

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
        
        Ext.apply(this, defConfig);
        
        this.callParent();
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
            width: 200,
            store: Ext.create('Ext.data.Store', {
                    model: 'SearchParameter',
                    data: [{
                        abbreviation: 'select',
                        name: '-Select-'
                    },{
                        abbreviation: 'any',
                        name: 'Any'
                    }].concat(bookProperties)
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
                        case 'year':
                            this.ownerCt.add([{xtype: 'yearbetweenfield', name: 'value'}]);
                            break;
                        case 'select':
                            if (this.ownerCt.next('[xtype=searchfield]') != null)
                                this.up('[xtype=searchpanel]').remove(this.ownerCt);
                            break;
                        default:
                            this.ownerCt.add([{xtype: 'textfield', name: 'value'}]);
                            break;

                    }
                    if (this.up('[xtype=searchpanel]') && this.up('[xtype=searchpanel]').getComponent(this.up('[xtype=searchpanel]').items.length-1).down('[name=type]').getValue() != 'select')
                    {
                        this.up('[xtype=searchpanel]').add([{xtype: 'searchfield'}]);
                    }
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
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
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});


Ext.define('SP.Search.SearchPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.searchpanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            border: 0,
            style: 'padding: 10px;',
            
            items: [{
                xtype: 'searchfield'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select',firstField,{});
    }
});






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

Ext.define('SP.Search.ResultSet', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresultset',

    initComponent: function() {
        var _this = this;
    
        function getSearchColumnStore(data)
        {
            var columns = Ext.create('Ext.data.Store', {
                model: 'SP.Search.SearchColumnModel',
                data: data.columns
            });
            
            return columns;
        }

        function getSearchResultStore(data, columns)
        {
            var store = Ext.create('Ext.data.ArrayStore', {
                fields: function()
                {
                    var cols = columns.getRange();
                    var fields = [];
                    for (var i = 0; i < cols.length; i++)
                    {
                        fields[fields.length] = {name: cols[i].get('name')};
                    }
                    return fields;
                }(),
                pageSize: 2,
                data: data.records,
                pagedSort: function(sorters, direction)
                {
                    this.loadData(data.records);
                    var s = this.sort(sorters, direction);
                    this.loadData(this.data.getRange().slice((this.currentPage-1)*this.pageSize, (this.currentPage)*this.pageSize));
                    return s;
                }
            });
            
            store.on('load',
                function(store, records, successful, operation)
                {
                    this.loadData(data.records);
                    this.loadData(this.data.getRange().slice((this.currentPage-1)*this.pageSize, (this.currentPage)*this.pageSize));
                },
                store
            );
            
            store.load();
            
            return store;
        }
        
        var cols = getSearchColumnStore(this.data);
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<div class="bookitem" style="border: 1px solid #DDDDDD; margin: 10px; cursor: pointer">',
                        '<div style="float: left; width: 50px; height: 67px">',
                            '<img src="{thumbnail}" style="width: 50px; height: 67px;"/>',
                        '</div>',
                        '<div style="float: left">',
                            '<table>{properties}</table>',
                        '</div>',
                        '<div style="clear: both"></div>',
                    '</div>',
                '</tpl>',
            ],
            store: getSearchResultStore(this.data, cols),
//            trackOver: true,
//            overItemCls: 'x-item-over',
            itemSelector: 'div.bookitem',
            emptyText: 'No books found.',
            prepareData: function(data) {
                var properties = "";
                for (var field in data)
                {
                    var col = cols.findRecord('name', field);
                    if (col != undefined && col.get('desc') != undefined && col.get('show'))
                    {
                        properties += '<tr><td>' + col.get('desc') + ': </td><td>' + data[field] + '</td></tr>';
                    }
                }
                data['properties'] = properties;
                return data;
            },
            listeners: {
                selectionchange: function(view, nodes)
                {
                    if (nodes.length != 0)
                    {
                        alert(_this.getSelectionModel().selected.get(0).get('title')); // TODO: actually open the book.
                    }
                }
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    }
});

Ext.define('SP.Search.SortComboBox', {
    extend: 'Ext.container.Container',
    alias: 'widget.sortcombobox',
    requires: ['*'],

    initComponent: function() {
        var _this = this;
        
        var defConfig = {
            layout: 'hbox',
            items: [{
                xtype: 'sortcomboboxfield'
            },{
                xtype: 'checkbox',
                listeners: {
                    change: function()
                    {
                        _this.sortFn();
                    }
                },
                labelSeparator: '',
                labelWidth: 'auto',
                style: 'margin-left: 5px;',
                fieldLabel: 'Inverted',
                labelAlign: 'right'
            }],
            getSorter: function()
            {
                var val = _this.getComponent(0).getValue();
                if (val)
                {
                    return { property: val, direction: (_this.getComponent(1).getValue() ? 'DESC' : 'ASC') }
                }
                return null;
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
    });

Ext.define('SP.Search.SortComboBoxField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.sortcomboboxfield',
    requires: ['*'],
    
    initComponent: function() {
        var _this = this;
        
        var defConfig = {
            store: Ext.create('Ext.data.Store', {
                    model: 'SearchParameter',
                    data: [{
                        abbreviation: 'modified',
                        name: 'Date last modified'
                    },{
                        abbreviation: 'uploaded',
                        name: 'Date uploaded'
                    }].concat(bookProperties)
                }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbreviation',
            forceSelection: true,
            listeners: {
                select: function(combo)
                {
                    _this.ownerCt.sortFn();
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('SP.Search.SearchResultView', {
    extend: 'Ext.Panel',
    alias: 'widget.searchresults',
    requires: ['*'],
    
    initComponent: function() {
        var _this = this;

        function sort()
        {
            var current = _this.down('[xtype=sortcombobox]');
            var sorters = [];
            do
            {
                var val = current.getSorter();
                if (val)
                {
                    sorters[sorters.length] = val;
                }
            } while(current = current.nextSibling('[xtype=sortcombobox]'));
            var results = _this.down('[xtype=searchresultset]');
            if (results)
            {
                results.store.pagedSort(sorters);
            }
        };
        
        var defConfig = {
            title: 'Search results',
            border: 0,
            items: [{
                xtype: 'panel',
                name: 'sort',
                border: 0,
                style: 'padding: 10px;',
                items: [{
                    xtype: 'sortcombobox',
                    fieldLabel: 'Sort by',
                    sortFn: sort
                },{
                    xtype: 'sortcombobox',
                    fieldLabel: 'then',
                    sortFn: sort
                },{
                    xtype: 'sortcombobox',
                    fieldLabel: 'then',
                    sortFn: sort
                }]
            },{
                xtype: 'panel',
                name: 'results',
                border: 0
            }],
            setData: function(data) {
                _this.down('[name=results]').removeAll();
                _this.down('[name=results]').add([{
                    xtype: 'searchresultset',
                    data: data
                }]);
                _this.down('[name=results]').add([{
                    xtype: 'pagingtoolbar',
                    store: _this.down('[name=results]').getComponent(0).getStore(),
                    displayInfo: true,
                    displayMsg: 'Displaying results {0} - {1} of {2}',
                    emptyMsg: 'No books found'
                }]);
                _this.down('[name=results]').down('[xtype=pagingtoolbar]').remove('refresh');
                _this.down('[name=results]').down('[xtype=pagingtoolbar]').add({id: 'refresh', enable: Ext.emptyFn});
                sort();
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('SP.Search.BookSearch', {
    extend: 'Ext.Panel',
    alias: 'widget.booksearch',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            title: 'Search',
            
            items: [{
                xtype: 'panel',
                title: 'Search',
                border: 0,
                items: [{
                    xtype: 'searchpanel'
                }]
            },{
                xtype: 'button',
                text: 'Search',
                width: 140,
                style: 'margin: 10px;',
                handler: function()
                {
                    var fields = [];
                    for (var i = 0; i < _this.down('[xtype=searchpanel]').items.length; ++i)
                    {
                        var val = _this.down('[xtype=searchpanel]').items.get(i).getValue();
                        if (val.type != "select")
                        {
                            fields[fields.length] = _this.down('[xtype=searchpanel]').items.get(i).getValue();
                        }
                    }
                    
                    function callback(success, data)
                    {
                        if (!success)
                        {
                            alert('Failed to get search results'); //TODO
                        }
                        else
                        {
                            _this.ownerCt.down('[xtype=searchresults]').setData(data);
                        }
                    }
                    
                    SP.JSON.url = 'searchexample.json'; // TODO: should not be necessary anymore
                    SP.JSON.doRequest('searchbooks', fields, callback);
                }
            },{
                xtype: 'searchresults',
                title: 'Search results'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select',firstField,{});
    }
});

