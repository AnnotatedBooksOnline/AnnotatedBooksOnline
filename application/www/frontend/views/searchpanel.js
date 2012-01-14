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
}/*,{
    abbreviation: 'version',
    name: 'Version'
},{
    abbreviation: 'language',
    name: 'Language'
}*/,{
    abbreviation: 'library',
    name: 'Library'
},{
    abbreviation: 'signature',
    name: 'Signature',
    defaultOn: true
},{
    abbreviation: 'provenance',
    name: 'Provenance'
}/*,{
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
        this.store = this.getResultStore(this.data, this.cols);
        
        var _this = this;
        var defConfig = {
            tpl: [
                '<tpl for=".">',
                    '<table class="bookitem" style="margin: 10px; cursor: pointer;">',
                        '<tr>',
                            '<td><img src="{thumbnail}" style="width: 50px; height: 67px;"/></td>',
                            '<td><table style="margin: 5px; margin-left: 10px">{properties}</table></td>',
                        '</tr>',
                    '</table>',
                    '<hr style="margin: 0px;">',
                '</tpl>',
            ],
            fullData: this.data,
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
                    //_this.up('tabpanel').setLoading(true);
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
        var properties = '';
        for (var field in data)
        {
            var col = this.cols.findRecord('name', field);
            if (col && col.get('desc') && col.get('show') && data[field] != null && data[field].length != "")
            {
                properties += '<tr><td style="padding-right: 5px; font-weight: bold;">'
                            + col.get('desc') + ': </td><td>' + data[field] + '</td></tr>';
            }
        }
        
        data['properties'] = properties;
        
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

    getResultStore: function(data, columns)
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
            data: data,
            pagedSort: function(sorters, direction)
            {
                this.loadData(data);
                var sorted = this.sort(sorters, direction);
                this.loadData(this.data.getRange().slice((this.currentPage - 1) * this.pageSize,
                    this.currentPage * this.pageSize));
                return sorted;
            }
        });
        
        store.on('load',
            function(store, records, successful, operation)
            {
                this.loadData(data);
                this.loadData(this.data.getRange().slice((this.currentPage - 1) * this.pageSize,
                    this.currentPage * this.pageSize));
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
            }]
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
        
        var results = this.down('searchresultsview');
        if (results)
        {
            results.store.pagedSort(sorters);
        }
    },
    
    setData: function(data)
    {
        var results = this.down('[name=results]');
        
        var currentToolbar = this.down('pagingtoolbar');
        if (currentToolbar != null)
        {
            results.removeDocked(currentToolbar);
        }
        
        results.removeAll();
        
        if (data.length > 0)
        {
            results.add({
                xtype: 'searchresultsview',
                data: data,
                cols: this.up('searchpanel').down('[name=parameters]').getColumns()
            });
            
            results.addDocked({
                xtype: 'pagingtoolbar',
                docked: 'top',
                store: results.getComponent(0).getStore(),
                displayInfo: true,
                displayMsg: 'Displaying books {0} - {1} of {2}'
            });
            
            results.down('pagingtoolbar').down('[itemId=refresh]').hide();
            
            this.sort();
        }
        else
        {
            results.add({
                xtype: 'panel',
                border: false,
                bodyPadding: 10,
                html: 'No results matching your search were found.'
            });
        }
    },
    updateColumns: function()
    {
        var view = this.down('[name=results]').down('searchresultsview');
        
        if (view != null)
        {
            this.setData(view.fullData);
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
                    me.setLoading(true);
                    
                    // Request book results.
                    var onSuccess = function(data)
                    {
                        // Set resulting data on search results panel.
                        this.down('searchresultspanel').setData(data);
                        me.setLoading(false);
                    };
                    
                    var onFailure = function()
                    {
                        me.setLoading(false);
                        return true;
                    }
                    
                    RequestManager.getInstance().request('Book', 'search', fields, _this, onSuccess, onFailure);
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
                        xtype: 'panel',
                        border: false,
                        html: 'Show:',
                        style: 'margin-bottom: 5px;'
                    }];
                    
                    var props = bookProperties.concat([{
                        abbreviation: 'headline',
                        name: 'Headline',
                        defaultOn: true
                    }]);
                    
                    for (var i = 0; i < props.length; i++)
                    {
                        items[i+1] = {
                            xtype: 'checkbox',
                            boxLabel: props[i].name,
                            checked: props[i].defaultOn == true,
                            resultField: props[i].abbreviation,
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
                    for (var i = 0; i < this.items.length-1; i++)
                    {
                        cols[i] = this.items.get(i+1).getColumn();
                    }
                    cols[cols.length] = {
                        desc: 'Thumbnail',
                        name: 'thumbnail',
                        show: false
                    };
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
                    xtype: 'notespanel',
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
