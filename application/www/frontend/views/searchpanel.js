"use strict";

/*
 * Search models and properties.
 */

var bookProperties = [{
    abbreviation: 'title',
    name: 'Title',
    defaultOn: true
},{
    abbreviation: 'author',
    name: 'Author',
    defaultOn: true
},{
    abbreviation: 'year',
    name: 'Year of publication',
    defaultOn: true
},{
    abbreviation: 'place',
    name: 'Place published'
},{
    abbreviation: 'publisher',
    name: 'Publisher'
},{
    abbreviation: 'version',
    name: 'Edition'
},{
    abbreviation: 'language',
    name: 'Language'
},{
    abbreviation: 'library',
    name: 'Library'
},{
    abbreviation: 'signature',
    name: 'Signature',
    defaultOn: true
},{
    abbreviation: 'provenance',
    name: 'Provenance'
},{
    abbreviation: 'annotlanguage',
    name: 'Language of annotations'
}];

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

/*
 * Year between field class.
 */

Ext.define('Ext.ux.YearBetweenField', {
    extend: 'Ext.container.Container',
    alias: 'widget.yearbetweenfield',
    
    initComponent: function()
    {
        var defConfig = {
            layout: {
                type: 'hbox'
            },
            defaults: {
                flex: 0,
                xtype: 'numberfield',
                allowDecimals: false,
                autoStripChars: true,
                allowNegative: false,
                labelSeparator: '',
                labelWidth: 'auto',
                style: 'margin-right: 5px;',
                allowBlank: true,
                enableKeyEvents: true
            },
            items: [{
                name: 'from',
                fieldLabel: 'Between',
                listeners: {
                    'blur': function(from, f) {
                        var to = this.nextSibling('[name=to]');
                        var fromValue = from.getValue();
                        var toValue = to.getValue()
                        if (toValue == null || parseInt(fromValue) > parseInt(toValue)) 
                        {
                            to.setValue(fromValue);
                        }
                        return;
                    },
                    'spin': function(from, direction) {
                        var to = this.nextSibling('[name=to]');
                        var fromValue = parseInt(from.getValue());
                        var toValue = parseInt(to.getValue());
                        
                        if (direction=='up')
                        {
                            fromValue++;
                        }
                        else
                        {
                            fromValue--;
                        }
                        
                        if (to.getValue() == null || fromValue > toValue) 
                        {
                            to.markInvalid('This value should be equal to or greater than the first value.');
                        }
                        else
                        {
                            to.validate();
                        }
                        
                        return;
                    },
                    specialkey: function(field, e)
                    {
                        if (e.getKey() == e.ENTER)
                        {
                            var button = this.up('searchpanel').down('[name=searchbutton]');
                            button.search();
                        }
                    }
                }
            },{
                name: 'to',
                fieldLabel: 'and',
                listeners: {
                    'blur': function(to, t) {
                        var from = this.previousSibling('[name=from]');
                        var fromValue = from.getValue();
                        var toValue = to.getValue();
                        if (fromValue == null || parseInt(fromValue) > parseInt(toValue)) 
                        {
                            from.setValue(toValue);
                        }
                        return;
                    },
                    'spin': function(to, direction) {
                        var from = this.previousSibling('[name=from]');
                        var fromValue = parseInt(from.getValue());
                        var toValue = parseInt(to.getValue());
                        
                        if (direction=='up')
                        {
                            toValue++;
                        }
                        else
                        {
                            toValue--;
                        }
                        
                        if (from.getValue() == null || fromValue > toValue) 
                        {
                            from.markInvalid('This value should be equal to or lower than the second value.');
                        }
                        else
                        {
                            from.validate();
                        }
                        
                        return;
                    },
                    specialkey: function(field, e)
                    {
                        if (e.getKey() == e.ENTER)
                        {
                            var button = this.up('searchpanel').down('[name=searchbutton]');
                            button.search();
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
    },
    
    getValue: function()
    {
        var value = {
            from: this.down('[name=from]').getValue(), 
            to:   this.down('[name=to]').getValue()
        };
        
        return value;
    }
});

/*
 * Search combobox class.
 */

Ext.define('Ext.ux.SearchComboBoxField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.searchcomboboxfield',
    
    initComponent: function()
    {
        var store = Ext.create('Ext.data.Store', { 
            model: 'Ext.ux.SearchParameterModel',
            data: [{
                abbreviation: 'select',
                name: '- Select -'
            },{
                abbreviation: 'any',
                name: 'Any'
            }].concat(bookProperties)
        });
        
        var defConfig = {
            width: 200,
            store: store,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbreviation',
            forceSelection: true,
            editable: false,
            listeners: {
                select: function(combo)
                {
                    this.ownerCt.getComponent(2).setDisabled(false);
                    var value = this.ownerCt.getComponent(1).getXType() == 'textfield' ? this.ownerCt.getComponent(1).getValue() : '';
                    this.ownerCt.remove(this.ownerCt.getComponent(1));
                    switch (combo.getValue())
                    {
                        case 'year':
                            this.ownerCt.insert(1, [{xtype: 'yearbetweenfield', name: 'value'}]);
                            break;
                            
                        case 'select':
                            if (this.ownerCt.next('searchfield') != null)
                            {
                                this.up('searchfieldspanel').remove(this.ownerCt);
                            }
                            
                            break;
                            
                        default:
                            this.ownerCt.insert(1, [{xtype: 'textfield', name: 'value', value: value}]);
                            break;
                    }
                    
                    var searchFieldsPanel = this.up('searchfieldspanel');
                    
                    if (searchFieldsPanel &&
                        searchFieldsPanel.getComponent(searchFieldsPanel.items.length - 1).
                        down('[name=type]').getValue() != 'select')
                    {
                        searchFieldsPanel.add([{xtype: 'searchfield'}]);
                    }
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
        
        this.setValue('select');
    }
});

/*
 * Search field class.
 */

Ext.define('Ext.ux.SearchField', {
    extend: 'Ext.container.Container',
    alias: 'widget.searchfield',
    
    initComponent: function()
    {
        var defConfig = {
            layout: {
                type: 'hbox'
            },
            defaults: {
                flex: 0,
                style: 'margin-right: 15px;',
                width: 500,
                allowBlank: true,
                listeners: {
                    specialkey: function(field, e)
                    {
                        if (e.getKey() == e.ENTER)
                        {
                            var button = this.up('searchpanel').down('[name=searchbutton]');
                            button.search();
                        }
                    }
                }
            },
            items: [{
                xtype: 'searchcomboboxfield',
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
                        this.up('searchfieldspanel').remove(this.ownerCt);
                    }
                }
            }]
        }
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
    },
            
    getValue: function()
    {
        var value = {
            type:  this.down('[name=type]').getValue(),
            value: this.down('[name=value]').getValue()
        };
        
        return value;
    }
});

/*
 * Search fields panel class.
 */

Ext.define('Ext.ux.SearchFieldsPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.searchfieldspanel',
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            border: false,
            bodyPadding: 10,
            
            items: [{
                xtype: 'searchfield'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
        
        var firstField = this.getComponent(0).down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select', firstField, {});
    }
});

/*
 * Search results view class.
 */

Ext.define('Ext.ux.SearchResultsView', {
    extend: 'Ext.view.View',
    alias: 'widget.searchresultsview',

    initComponent: function()
    {
        this.cols  = this.getColumnStore(this.cols);
        this.store = this.getResultStore(this.cols);
        
        var _this = this;
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<table class="bookitem" style="margin: 10px; cursor: pointer;">',
                        '<tr>',
                            '{maybethumbnail}',
                            '<td><table style="margin: 5px; margin-left: 10px">{properties}</table></td>',
                        '</tr>',
                    '</table>',
                    '<hr style="margin: 0px;">',
                '</tpl>',
            ],
//            trackOver: true,
//            overItemCls: 'x-item-over',
            itemSelector: 'table.bookitem',
            region: 'center',
            listeners: {
                itemclick: function(view, record)
                {
                    // Open book in a new tab.
                    var pageNumber = record.get('firstPage');
                    var bindingId  = record.get('bindingId');
                    Application.getInstance().gotoTab('binding',
                        (pageNumber == null ? [bindingId] : [bindingId, pageNumber]), true);
                }
            }
        };
        
        Ext.apply(this, defConfig);
        this.superclass.initComponent.apply(this, []);
    },
    
    prepareData: function(data)
    {
        var thumbnail = '';
        var properties = '';
        for (var field in data)
        {
            var col = this.cols.findRecord('name', field);
            if (col && col.get('desc') && col.get('show') && data[field] != null && data[field].length != "")
            {
                if (field == 'headline')
                {
                    properties += '<tr><td colspan="2" style="font-style: italic; padding-top: 5px">' + data[field] + '</td></tr>';
                }
                else if (field == 'thumbnail')
                {
                    thumbnail = '<td><img src="' + data[field] + '" style="max-width: 50px; max-height: 67px;"/></td>'
                }
                else
                {
                    properties += '<tr><td style="padding-right: 5px; font-weight: bold;">'
                                + col.get('desc') + ': </td><td>' + data[field] + '</td></tr>';
                }
            }
        }
        
        data['properties'] = properties;
        data['maybethumbnail'] = thumbnail;
        
        return data;
    },
    
    getColumnStore: function(data)
    {
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.SearchColumnModel',
            data: data
        });
        
        return store;
    },

    getResultStore: function(columns)
    {
        var _this = this;
        
        var store = Ext.create('Ext.data.Store', {
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
            pageSize: _this.searchPageSize,
            data: [],
            setPageSize: function(pageSize)
            {
                var page = Math.floor((this.currentPage - 1) * this.pageSize / pageSize) + 1;
                this.pageSize = pageSize;
                this.loadPage(page);
            },
            setSorters: function(sorters)
            {
                _this.searchSorters = sorters;
                this.loadPage(1);
            },
            setSelectors: function(selectors)
            {
                _this.searchFields = selectors;
                this.loadPage(1);
            }
        });
        
        store.on('beforeload',
            function()
            {
                _this.searchPanel.setLoading(true);
                var fields = {
                    selectors: _this.searchFields,
                    sorters: _this.searchSorters,
                    limit: this.pageSize,
                    page: this.currentPage
                };
                RequestManager.getInstance().request('Book', 'search', fields, this,
                    function(data)
                    {
                        if (data.total == 0)
                        {
                            _this.up('[name=results]').down('pagingtoolbar').hide();
                            _this.up('[name=results]').down('[name=noresults]').show();
                        }
                        else
                        {
                            _this.up('[name=results]').down('pagingtoolbar').show();
                            _this.up('[name=results]').down('[name=noresults]').hide();
                        }
                        this.totalCount = data.total;
                        this.loadData(data.records);
                        store.fireEvent('load');
                        _this.searchPanel.setLoading(false);
                    },
                    function()
                    {
                        _this.searchPanel.setLoading(false);
                        return true;
                    }
                );
                return false;
            },
            store
        );
        
        store.load();
        
        return store;
    }
});

/*
 * Sort combobox class.
 */

Ext.define('Ext.ux.SortComboBox', {
    extend: 'Ext.container.Container',
    alias: 'widget.sortcombobox',

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
                var value = _this.getComponent(0).getValue();
                if (value && value != 'none')
                {
                    return { property: value, direction: (_this.getComponent(1).getValue() ? 'DESC' : 'ASC') }
                }
                
                return null;
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
    }
});

/*
 * Sort combobox field class.
 */

Ext.define('Ext.ux.SortComboBoxField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.sortcomboboxfield',
    requires: ['*'],
    
    initComponent: function() {
        var _this = this;
        
        var propertyData = [{
            abbreviation: 'none',
            name: '- Select -'
        }/*,{
            abbreviation: 'modified',
            name: 'Date last modified'
        }*/,{
            abbreviation: 'id',
            name: 'Date uploaded'
        }].concat(bookProperties);
        
        var defConfig = {
            store: Ext.create('Ext.data.Store', {
                model: 'Ext.ux.SearchParameterModel',
                data: propertyData
            }),
            queryMode: 'local',
            displayField: 'name',
            valueField: 'abbreviation',
            forceSelection: true,
            editable: false,
            listeners: {
                select: function(combo)
                {
                    if (_this.ownerCt != undefined)
                    {
                        _this.ownerCt.sortFn();
                        
                        // Hide this value in the other search boxes.
                        var usedProps = [];
                        var current = this.up('searchpanel').down('sortcomboboxfield');
                        do
                        {
                            if (current.getValue() != 'none')
                            {
                                usedProps[usedProps.length] = current.getValue();
                            }
                            current.getStore().loadData(propertyData);
                        } while (current = current.nextNode('sortcomboboxfield'));
                        current = this.up('searchpanel').down('sortcomboboxfield');
                        do
                        {
                            var store = current.getStore();
                            for (var i = 0; i < usedProps.length; i++)
                            {
                                if (current.getValue() != usedProps[i])
                                {
                                    var record = store.findExact('abbreviation', usedProps[i]);
                                    store.removeAt(record);
                                }
                            }
                        } while (current = current.nextNode('sortcomboboxfield'));
                    }
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
        
        this.select('none');
        this.fireEvent('select',this,{});
    }
});

/*
 * Search results panel class.
 */

Ext.define('Ext.ux.SearchResultsPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.searchresultspanel',
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            title: 'Search results',
            border: false,
            layout: 'border',
            items: [{
                xtype: 'panel',
                name: 'results',
                border: false,
                region: 'center'
            }],
            searchPageSize: 5,
            searchSorters: [],
            listeners: {
                afterrender: function()
                {
                    var results = this.down('[name=results]');
                    results.add({
                        xtype: 'searchresultsview',
                        searchFields: [],
                        searchPanel: this.up('searchpanel'),
                        searchSorters: this.searchSorters,
                        searchPageSize: this.searchPageSize,
                        cols: this.up('searchpanel').down('[name=parameters]').getColumns()
                    });
                    results.add({
                        xtype: 'panel',
                        border: false,
                        bodyPadding: 10,
                        html: 'No results matching your search were found.',
                        hidden: true,
                        name: 'noresults'
                    });
                    results.addDocked({
                        xtype: 'pagingtoolbar',
                        docked: 'top',
                        store: results.getComponent(0).getStore(),
                        displayInfo: true,
                        displayMsg: 'Displaying books {0} - {1} of {2}'
                    });
                    results.down('pagingtoolbar').down('[itemId=refresh]').hide();
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
    },
    
    sort: function()
    {
        var current = this.up('searchpanel').down('sortcombobox');
        var sorters = [];
        do
        {
            var val = current.getSorter();
            if (val)
            {
                sorters[sorters.length] = val;
            }
        } while (current = current.nextSibling('sortcombobox'));
        
        this.searchSorters = sorters;
        var results = this.down('searchresultsview');
        results.store.setSorters(sorters);
    },
    
    setPageSize: function(num)
    {
        this.searchPageSize = num;
        var results = this.down('searchresultsview');
        results.store.setPageSize(num);
    },
    
    search: function(fields)
    {
        var results = this.down('searchresultsview');
        results.store.setSelectors(fields);
    },
    
    updateColumns: function()
    {
        var view = this.down('[name=results]').down('searchresultsview');
        
        if (view)
        {
            var columns = this.up('searchpanel').down('[name=parameters]').getColumns();
            columns = view.getColumnStore(columns);
            view.cols = columns;
            view.store.fireEvent('datachanged');
        }
    }
});

/*
 * Search panel class.
 */

Ext.define('Ext.ux.SearchPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.searchpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var centerRegion = {
            region: 'center',
            xtype: 'panel',
            autoScroll: true,
            items: [{
                title: 'Search',
                xtype: 'searchfieldspanel'
            },{
                xtype: 'button',
                text: 'Search',
                name: 'searchbutton',
                width: 140,
                style: 'margin: 10px;',
                handler: function()
                {
                    this.search();
                },
                search: function()
                {
                    // Get search fields.
                    var fields = [];
                    for (var i = 0; i < _this.down('searchfieldspanel').items.length; ++i)
                    {
                        var val = _this.down('searchfieldspanel').items.get(i).getValue();
                        if (val.type != 'select')
                        {
                            fields[fields.length] = _this.down('searchfieldspanel').items.get(i).getValue();
                        }
                    }
                    
                    var me = this.up('panel');
                    
                    me.down('searchresultspanel').search(fields);
                }
            },{
                xtype: 'searchresultspanel'
            }]
        };
        
        var sort = function()
        {
            _this.down('searchresultspanel').sort();
        };
        
        var westRegion = {
            region: 'west',
            xtype: 'panel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            collapsible: true,
            title: 'Advanced options',
            width: 200,
            items: [{
                xtype: 'panel',
                name: 'sort',
                border: false,
                title: 'Sorting options',
                bodyPadding: 10,
                collapsible: true,
                items: [{
                    xtype: 'panel',
                    border: false,
                    html: 'Sort by:',
                    style: 'margin-bottom: 5px'
                },{
                    xtype: 'sortcombobox',
                    sortFn: sort
                },{
                    xtype: 'panel',
                    border: false,
                    html: 'Then by:',
                    style: 'margin: 5px 0px'
                },{
                    xtype: 'sortcombobox',
                    sortFn: sort
                },{
                    xtype: 'panel',
                    border: false,
                    html: 'Then by:',
                    style: 'margin: 5px 0px'
                },{
                    xtype: 'sortcombobox',
                    sortFn: sort
                },{
                    xtype: 'panel',
                    border: false,
                    html: '<font size="1" >(Select checkbox to invert sorting)</font>',
                    style: 'margin-top: 5px'
                }]
            },{
                xtype: 'panel',
                name: 'parameters',
                title: 'Result options',
                border: false,
                bodyPadding: 10,
                collapsible: true,
                items: function()
                {
                    var items = [{
                        xtype: 'combobox',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['number'],
                            data: [{
                                number: 1
                            },{
                                number: 2
                            },{
                                number: 5
                            },{
                                number: 10
                            },{
                                number: 25
                            }]
                        }),
                        queryMode: 'local',
                        displayField: 'number',
                        valueField: 'number',
                        forceSelection: true,
                        editable: false,
                        fieldLabel: 'Books per page',
                        style: 'margin-bottom: 10px',
                        width: 160,
                        listeners: {
                            select: function()
                            {
                                _this.down('searchresultspanel').setPageSize(this.getValue());
                            },
                            afterrender: function()
                            {
                                this.select('5');
                            }
                        }
                    },{
                        xtype: 'panel',
                        border: false,
                        html: 'Show:',
                        style: 'margin-bottom: 5px;'
                    }];
                    
                    var props = bookProperties.concat([{
                        abbreviation: 'headline',
                        name: 'Highlights',
                        defaultOn: true
                    },{
                        abbreviation: 'thumbnail',
                        name: 'Thumbnail',
                        defaultOn: true
                    }]);
                    
                    for (var i = 0; i < props.length; i++)
                    {
                        items[i+2] = {
                            xtype: 'checkbox',
                            boxLabel: props[i].name,
                            checked: props[i].defaultOn == true,
                            resultField: props[i].abbreviation,
                            style: (props[i].abbreviation == 'headline') ? 'padding-top: 10px' : '',
                            getColumn: function()
                            {
                                return {
                                    desc: this.boxLabel,
                                    name: this.resultField,
                                    show: this.getValue()
                                };
                            },
                            listeners: {
                                change: function ()
                                {
                                    this.up('searchpanel').down('searchresultspanel').updateColumns();
                                }
                            }
                        };
                    }
                    return items;
                }(),
                getColumns: function()
                {
                    var cols = [];
                    for (var i = 0; i < this.items.length-2; i++)
                    {
                        cols[i] = this.items.get(i+2).getColumn();
                    }
                    cols[cols.length] = {
                        desc: 'Identifier',
                        name: 'id',
                        show: false
                    };
                    cols[cols.length] = {
                        desc: 'Binding',
                        name: 'bindingId',
                        show: false
                    };
                    cols[cols.length] = {
                        desc: 'First page',
                        name: 'firstPage',
                        show: false
                    };
                    return cols;
                }
            }]
        };
        
        var eastRegion = {
            region: 'east',
            xtype: 'panel',
            name: 'eastregion',
            title: 'Workspace',
            split: true,
            collapsible: true,
            collapsed: false,
            width: 300,
            minWidth: 300,
            layout: 'fit',
            hidden: true,
            items: [{
                xtype: 'tabpanel',
                layout: 'fit',
                border: false,
                items: [{
                    title: 'Notes',
                    xtype: 'notespanel'
                }]
            }]
        };
        
        var defConfig = {
            title: 'Search',
            layout: {
                type: 'border'
            },
            items: [westRegion, centerRegion, eastRegion]
        };
        
        Ext.apply(this, defConfig);
        
        this.superclass.initComponent.apply(this, []);
        
        var firstField = this.down('[name=type]');
        firstField.select('any');
        firstField.fireEvent('select',firstField,{});
        
        if (Authentication.getInstance().isLoggedOn())
        {
            this.onLoggedOn();
        }
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
    },
    
    onLoggedOn: function()
    {
        this.down('[name=eastregion]').show();
    },
    
    onLoggedOut: function()
    {
        this.down('[name=eastregion]').hide();
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            this.onLoggedOn();
        }
        else
        {
           this.onLoggedOut();
        }
    }
});

