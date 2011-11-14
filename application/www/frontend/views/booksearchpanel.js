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
}/*,{
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
}*/];

Ext.define('Ext.ux.SearchParameterModel', {
    extend: 'Ext.data.Model',
    fields: [{
        type: 'string',
        name: 'abbreviation'
    },{
        type: 'string',
        name: 'description'
    }]
});

Ext.define('Ext.ux.SearchColumnModel', {
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
                    model: 'Ext.ux.SearchParameterModel',
                    data: [{
                        abbreviation: 'select',
                        name: '-Select-'
                    }/*,{
                        abbreviation: 'any',
                        name: 'Any'
                    }*/].concat(bookProperties)
                }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbreviation',
            forceSelection: true,
            listeners: {
                select: function(combo)
                {
                    this.ownerCt.getComponent(2).setDisabled(false);
                    this.ownerCt.remove(this.ownerCt.getComponent(1));
                    switch (combo.getValue())
                    {
                        case 'year':
                            this.ownerCt.insert(1, [{xtype: 'yearbetweenfield', name: 'value'}]);
                            break;
                            
                        case 'select':
                            if (this.ownerCt.next('[xtype=searchfield]') != null)
                            {
                                this.up('[xtype=searchpanel]').remove(this.ownerCt);
                            }
                            
                            break;
                            
                        default:
                            this.ownerCt.insert(1, [{xtype: 'textfield', name: 'value'}]);
                            break;
                    }
                    
                    var searchPanel = this.up('[xtype=searchpanel]');
                    
                    if (searchPanel && searchPanel.getComponent(searchPanel.items.length-1).
                        down('[name=type]').getValue() != 'select')
                    {
                        searchPanel.add([{xtype: 'searchfield'}]);
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
            },{
                xtype: 'button',
                name: 'close',
                iconCls: 'remove-icon',
                width: 22,
                disabled: true,
                handler: function()
                {
                    if (this.ownerCt.getComponent(0).getValue() != 'select')
                    {
                        this.up('[xtype=searchpanel]').remove(this.ownerCt);
                    }
                }
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

Ext.define('Ext.ux.SearchPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.searchpanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            border: 0,
            bodyPadding: 10,
            
            items: [{
                xtype: 'searchfield'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select', firstField, {});
    }
});

Ext.define('Ext.ux.SearchResultSet', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresultset',

    initComponent: function()
    {
        var cols  = this.getSearchColumnStore(this.data);
        var store = this.getSearchResultStore(this.data, cols);
        
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<div class="bookitem" style="border: 1px solid #DDD; margin: 10px; cursor: pointer;">',
                        '<div style="float: left; width: 50px; height: 67px; margin-right: 10px;">',
                            '<img src="{thumbnail}" style="width: 50px; height: 67px;"/>',
                        '</div>',
                        '<div style="float: left; margin-top: 10px;">',
                            '<table>{properties}</table>',
                        '</div>',
                        '<div style="clear: both;"></div>',
                    '</div>',
                '</tpl>',
            ],
            store: store,
//            trackOver: true,
//            overItemCls: 'x-item-over',
            itemSelector: 'div.bookitem',
            emptyText: 'No books found.',
            prepareData: function(data)
            {
                var properties = '';
                for (var field in data)
                {
                    var col = cols.findRecord('name', field);
                    if (col && col.get('desc') && col.get('show'))
                    {
                        properties += '<tr><td style="padding-right: 5px; font-weight: bold;">'
                                    + col.get('desc') + ': </td><td>' + data[field] + '</td></tr>';
                    }
                }
                
                data['properties'] = properties;
                
                return data;
            },
            listeners: {
                itemclick: function(view, record)
                {
                    // Open book in a new tab.
                    var id = record.get('id');
                    
                    Application.getInstance().gotoTab('book', [id], true);
                }
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    getSearchColumnStore: function(data)
    {
        var columns = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.SearchColumnModel',
            data: data.columns
        });
        
        return columns;
    },

    getSearchResultStore: function(data, columns)
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
            pageSize: 5,
            data: data.records,
            pagedSort: function(sorters, direction)
            {
                this.loadData(data.records);
                var sorted = this.sort(sorters, direction);
                this.loadData(this.data.getRange().slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize));
                return sorted;
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
});

Ext.define('Ext.ux.SortComboBox', {
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
                //fieldLabel: 'Inverted',
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

Ext.define('Ext.ux.SortComboBoxField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.sortcomboboxfield',
    requires: ['*'],
    
    initComponent: function() {
        var _this = this;
        
        var defConfig = {
            store: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.SearchParameterModel',
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

Ext.define('Ext.ux.SearchResultView', {
    extend: 'Ext.Panel',
    alias: 'widget.searchresults',
    requires: ['*'],
    
    initComponent: function()
    {
        var _this = this;
        var sort = function() { _this.sort(); };
        
        var defConfig = {
            title: 'Search results',
            border: 0,
            layout: {
                type: 'hbox',
                align: 'top'
            },
            items: [{
                xtype: 'panel',
                name: 'results',
                border: 0,
                flex: 1
            },{
                xtype: 'panel',
                name: 'sort',
                border: 0,
                flex: 0,
                width: 200,
                bodyPadding: 10,
                items: [{
                    xtype: 'panel',
                    border: 0,
                    html: '<h2>Sorting</h2>',
                    style: 'margin-bottom: 10px'
                },{
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
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    sort: function()
    {
        var current = this.down('[xtype=sortcombobox]');
        var sorters = [];
        do
        {
            var val = current.getSorter();
            if (val)
            {
                sorters[sorters.length] = val;
            }
        } while (current = current.nextSibling('[xtype=sortcombobox]'));
        
        var results = this.down('[xtype=searchresultset]');
        if (results)
        {
            results.store.pagedSort(sorters);
        }
    },
    
    setData: function(data)
    {
        var results = this.down('[name=results]');
        
        results.removeAll();
        results.add({
            xtype: 'searchresultset',
            data: data
        });
        
        var currentToolbar = this.down('pagingtoolbar');
        results.removeDocked(currentToolbar);
        results.addDocked({
            xtype: 'pagingtoolbar',
            docked: 'top',
            store: results.getComponent(0).getStore(),
            displayInfo: true,
            displayMsg: 'Displaying books {0} - {1} of {2}',
            emptyMsg: 'No books found'
        });
        
        // TODO: Add sorting buttons to docked toolbar.
        // TODO: Use normal store instead of array store, so that refresh works. 
        
        //_this.down('[name=results]').down('[xtype=pagingtoolbar]').remove('refresh');
        //_this.down('[name=results]').down('[xtype=pagingtoolbar]').add({id: 'refresh', enable: Ext.emptyFn});
        
        this.sort();
    }
});

/*
 * Book search panel class.
 */

Ext.define('Ext.ux.BookSearchPanel', {
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
                    // Get search fields.
                    var fields = [];
                    for (var i = 0; i < _this.down('[xtype=searchpanel]').items.length; ++i)
                    {
                        var val = _this.down('[xtype=searchpanel]').items.get(i).getValue();
                        if (val.type != 'select')
                        {
                            fields[fields.length] = _this.down('[xtype=searchpanel]').items.get(i).getValue();
                        }
                    }
                    
                    // Request book results.
                    var onSuccess = function(data)
                    {
                        // Set resulting data on search results panel.
                        this.down('[xtype=searchresults]').setData(data);
                    };
                    
                    RequestManager.getInstance().request('Book', 'search', fields, _this, onSuccess);
                }
            },{
                xtype: 'searchresults'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('title');
        firstField.fireEvent('select',firstField,{});
    }
});
