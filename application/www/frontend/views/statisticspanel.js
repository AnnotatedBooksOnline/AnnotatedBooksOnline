Ext.define('Ext.ux.StatisticsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.statisticspanel',
    
    fetchData: function()
    {
        this.theStore.removeAll();
        
        var _this = this;
        
        RequestManager.getInstance().request(
            'Statistics',
            _this.requestAction,
            _this.requestData,
            _this,
            _this.onDataRetrieved,
            function()
            {
                return true;
            }
        );
    },
    
    openDetails: function(type, title, requestData)
    {
        var _this = this;
        var window = Ext.ux.StatisticsWindow.showStats(type, title, requestData);
        var closeStack = window.closeStack;
        window.closeStack = function()
        {
            closeStack();
            _this.closeStack();
        }
    },
    
    closeStack: function() {},
    
    onDataRetrieved: function(input)
    {
        var data = [];
        
        for(var i = 0; i < input.length; ++i)
        {
            var row = input[i];
            var result = [];
            for (var j = 0; j < this.fields.length; j++)
            {
                var field = this.fields[j];
                if (field instanceof Object && field.name != undefined)
                {
                    field = field.name;
                }
                result.push(row[field] || "");
            }
            data.push(result);
        }
        this.theStore.add(data);
    },
    
    gridFeatures: [{
        ftype:'grouping',
        groupHeaderTpl: 'Group {name}',
        startCollapsed: true
    }],
    
    gridListeners: {},
    
    initComponent: function()
    {
        var _this = this;
        
        this.theStore = Ext.create('Ext.data.ArrayStore', {
            fields: this.fields,
            data: []
        });
        
        var defConfig = {
            layout: 'border',
            items: [{
                xtype: 'grid',
                region: 'center',
                name: 'statisticsgrid',
                border: false,
                features: this.gridFeatures,
                columns: this.gridColumns,
                store: this.theStore,
                listeners: this.gridListeners,
                requestData: this.requestData,
                closeStack: this.closeStack,
                openDetails: this.openDetails
            }]
        };
        
        if (this.headerText !== undefined && this.headerText !== "")
        {
            defConfig.items.push({
                xtype: 'label',
                region: 'north',
                border: 3,
                padding: 3,
                margin: 5,
                layout: { align: 'middle' },
                text: this.headerText
            });
        }
        
        Ext.apply(this, defConfig);
        this.callParent();
        
        this.fetchData();
    }
});

Ext.define('Ext.ux.NewestUsersStatisticsPanel', {
    extend: 'Ext.ux.StatisticsPanel',
    alias: 'widget.newestusersstatisticspanel',

    gridColumns: [{
        text:      'Username',
        flex:      1,
        dataIndex: 'username',
        renderer:  'htmlEncode'
    },{
        text:      'Full name',
        flex:      1,
        dataIndex: 'firstName',
        renderer:  function(value, metadata, record)
        {
            return escape(record.get('firstName') + ' ' + record.get('lastName'));
        }
    },{
        text:      'Affiliation',
        flex:      1,
        dataIndex: 'affiliation',
        renderer:  'htmlEncode'
    },{
        text:      'Date of registration',
        flex:      1,
        dataIndex: 'registrationDate',
        renderer:  function(date)
        {
            return Ext.Date.format(date, 'F j, Y');
        }
    }],
    requestAction: 'newestUsers',
    fields: ['userId', 'username', 'firstName', 'lastName', 'affiliation',
    {
        name: 'registrationDate',
        type: 'date',
        dateFormat: 'timestamp'
    }],
    gridListeners: {
        itemdblclick: function(view, record)
        {
            this.openDetails('latestannotations',
                'Annotation history for user: ' + escape(record.get('username')),
                { userId: record.get('userId') }
            );
        }
    },
    headerText: 'Double-click a user to show the latest contributions of this user.'
});

Ext.define('Ext.ux.ActiveUsersStatisticsPanel', {
    extend: 'Ext.ux.StatisticsPanel',
    alias: 'widget.activeusersstatisticspanel',

    gridColumns: [{
        text:      'Username',
        flex:      1,
        dataIndex: 'username',
        renderer:  'htmlEncode'
    },{
        text:      'Full name',
        flex:      1,
        dataIndex: 'firstName',
        renderer:  function(value, metadata, record)
        {
            return escape(record.get('firstName') + ' ' + record.get('lastName'));
        }
    },{
        text:      'Affiliation',
        flex:      1,
        dataIndex: 'affiliation',
        renderer:  'htmlEncode'
    },{
        text:      'Last active',
        flex:      1,
        dataIndex: 'lastActive',
        renderer:  function(date)
        {
            return Ext.Date.format(date, 'F j, Y');
        }
    }],
    requestAction: 'activeUsers',
    fields: ['userId', 'username', 'firstName', 'lastName', 'affiliation',
    {
        name: 'lastActive',
        type: 'date',
        dateFormat: 'timestamp'
    }],
    gridListeners: {
        itemdblclick: function(view, record)
        {
            this.openDetails('latestannotations',
                'Annotation history for user: ' + escape(record.get('username')),
                { userId: record.get('userId') }
            );
        }
    },
    headerText: 'Double-click a user to show the latest contributions of this user.'
});

Ext.define('Ext.ux.NewestBindingsStatisticsPanel', {
    extend: 'Ext.ux.StatisticsPanel',
    alias: 'widget.newestbindingsstatisticspanel',

    gridColumns: [{
        text:      'Shelfmark',
        flex:      1,
        dataIndex: 'shelfmark',
        renderer:  'htmlEncode'
    },{
        text:      'Status',
        flex:      1,
        dataIndex: 'status',
        renderer:  'htmlEncode'
    },{
        text:      'Creator',
        flex:      1,
        dataIndex: 'firstName',
        renderer:  function(value, metadata, record)
        {
            return escape(record.get('firstName') + ' ' + record.get('lastName'));
        }
    },{
        text:      'Created on',
        flex:      1,
        dataIndex: 'createdOn',
        renderer:  function(date)
        {
            return Ext.Date.format(date, 'F j, Y');
        }
    },{
        text:      'Processing',
        flex:       1,
        dataIndex: 'progress',
        renderer:  'htmlEncode'
    }],
    requestAction: 'newestBindings',
    fields: ['bindingId', 'shelfmark', 'status', 'username', 'firstName', 'lastName', 'progress',
    {
        name: 'createdOn',
        type: 'date',
        dateFormat: 'timestamp'
    }],
    gridListeners: {
        itemdblclick: function(view, record)
        {
            this.openDetails('binding',
                'History for binding: ' + escape(record.get('shelfmark')),
                { bindingId: record.get('bindingId') }
            );
        }
    },
    headerText: 'Double-click a binding for more details.'
});

/**
 * Shows the latest annotation modifications for the given binding.
 */
Ext.define('Ext.ux.BindingStatisticsPanel', {
    extend: 'Ext.ux.StatisticsPanel',
    alias: 'widget.bindingstatisticspanel',

    gridColumns: [{
        text:      'Page',
        flex:      1,
        dataIndex: 'page',
        renderer:  'htmlEncode'
    },{
        text:      'Book',
        flex:      2,
        dataIndex: 'book',
        renderer:  'htmlEncode'
    },{
        text:      'Mutation',
        flex:      2,
        dataIndex: 'mutation',
        renderer:  'htmlEncode'
    },{
        text:      'Date',
        flex:      1,
        dataIndex: 'date',
        renderer:  function(date)
        {
            return Ext.Date.format(date, 'F j, Y');
        }
    }],
    requestAction: 'binding',
    fields: ['page', 'book', 'mutation',
    {
        name: 'date',
        type: 'date',
        dateFormat: 'timestamp'
    }],
    gridListeners: {
        itemdblclick: function(view, record)
        {
            Application.getInstance().gotoTab('binding',
                [this.requestData.bindingId, record.get('page')],
                true
            );
            this.closeStack();
        }
    },
    headerText: 'Double-click a row to navigate to the corresponding page.'
});

/**
 * Shows the latest annotation modifications.
 */
Ext.define('Ext.ux.LatestAnnotationsStatisticsPanel', {
    extend: 'Ext.ux.StatisticsPanel',
    alias: 'widget.latestannotationsstatisticspanel',

    gridColumns: [{
        text:      'Book',
        flex:      2,
        dataIndex: 'book',
        renderer:  'htmlEncode'
    },{
        text:      'Page',
        flex:      1,
        dataIndex: 'page',
        renderer:  'htmlEncode'
    },{
        text:      'Mutation',
        flex:      1,
        dataIndex: 'mutation',
        renderer:  'htmlEncode'
    },{
        text:      'Date',
        flex:      1,
        dataIndex: 'timeChanged',
        renderer:  function(date)
        {
            return Ext.Date.format(date, 'F j, Y');
        }
    },{
        text:      'Editor',
        flex:      1,
        dataIndex: 'firstName',
        renderer:  function(value, metadata, record)
        {
            return escape(record.get('firstName') + ' ' + record.get('lastName'));
        }
    }],
    requestAction: 'latestannotations',
    fields: ['page', 'book', 'mutation', 'firstName', 'lastName', 'bindingId', 'shelfmark',
    {
        name: 'timeChanged',
        type: 'date',
        dateFormat: 'timestamp'
    }],
    gridListeners: {
        itemdblclick: function(view, record)
        {
            this.openDetails('binding',
                'History for binding: ' + record.get('shelfmark'),
                { bindingId: record.get('bindingId') }
            );
                
        }
    },
    headerText: 'Double-click a row for more details on the corresponding binding.'
});


/**
 * Defines a modal window to show statistics data about a chosen subject.
 *
 * @param type         The statistics subject (user, annotation, ...)
 * @param requestData  Extra data to specify the subject (userId, ...), optional.
 * @param title        Title for the window. Default: 'History'
 *
 */
Ext.define('Ext.ux.StatisticsWindow', {
    extend: 'Ext.window.Window',
    
    title: 'History',
    modal: true,
    constrain: true,
    closable: true,
    width: 800,
    height: 600,
    layout: 'border',

    requestData: {},
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: 'fit',
            items: [{
                xtype: this.type + 'statisticspanel',
                name: this.type + 'statistics',
                requestData: this.requestData,
                closeStack: function()
                {
                    _this.closeStack();
                }
            }],
            closeStack: function()
            {
                _this.close();
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    statics: {
        showStats: function(type, title, requestData)
        {
            var defConfig = {
                type: type,
                requestData: requestData || {}
            };
            if (title != undefined)
            {
                defConfig.title = title;
            }
            var window = Ext.create('Ext.ux.StatisticsWindow', defConfig);
            window.show();
            return window;
        }
    }
});


/*
 * Statistics summary ('recent changes') tab.
 */

Ext.define('Ext.ux.StatisticsSummaryPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.statisticssummary',
    
    initComponent: function()
    {
        var defConfig = {
            border: false,
            name: 'statisticssummary',
            layout: 'accordion',
            items: [{
                xtype: 'newestusersstatisticspanel',
                title: 'Newest registered users'
            },{
                xtype: 'activeusersstatisticspanel',
                title: 'Most recently active users'
            },{
                xtype: 'newestbindingsstatisticspanel',
                title: 'Newest added bindings'
            },{
                xtype: 'latestannotationsstatisticspanel',
                title: 'Most recent annotation changes'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
