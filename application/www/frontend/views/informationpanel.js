/*
 * Binding information panel class.
 */
Ext.define('Ext.ux.BindingInformationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.bindinginformationpanel',
    layout: 'fit',
    
    //TODO: Commenting and cleaning up
    initComponent: function() 
    {
        var _this = this;
        this.bindingModel = this.viewer.getBinding().getModel();
        this.sstore = Ext.create('Ext.data.ArrayStore', 
        {
            fields: [
                {name: 'firstPage'},
                {name: 'property'}
            ],
            groupField: 'firstPage'
        });
         var defConfig = {
            border: false,
            width: '100%',
            layout: 'vbox',
            autoScroll: true,
            bbar: {
                xtype: 'button',
                text: 'Modify binding',
                handler: function()
                {
                    Application.getInstance().gotoTab('upload', [viewer.binding.bindingId], true);
                }
            },
            items: [{
                xtype: 'grid',
                id: 'bookInfo',
                name: 'grid',
                flex: 1,
                width: '100%',
                border: false,
                store: this.sstore,
                hideHeaders: true,
                features: [{
                    ftype: 'groupingsummary',
                    groupHeaderTpl: '{name:bookName}',
                    startCollapsed: true
                }],
                columns: [
                    {dataIndex: 'property', flex: 1, summaryType: function(records){
                    return '<span style="color: (255,0,0);"> Page '+records[0].get('firstPage')+'</span>';
                    }
                }]
            },{
                xtype: 'label',
                border: false,
                html: escape(this.bindingModel.get('library').libraryName) + ', ' +
                        escape(this.bindingModel.get('signature')),
                style: 'margin: 5px'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        var myData = [];
        var store = Ext.create('Ext.data.Store', {
        model: 'Ext.ux.BookModel',
        });
        store.filter({property: 'bindingId', value: this.bindingModel.get('bindingId')});
        store.load({
                        scope: this,
                        callback: function(records, operation, success)
                        {
                            Ext.Array.each(records, function(record)
                            {
                                    var firstPage = record.get('firstPage');
                                    record.authors().load({
                                        scope   : this,
                                        callback:function(records, operation, success) 
                                        {
                                            var authors='';
                                            Ext.Array.each(records, function(record) 
                                                {
                                                    authors += (', '+record.get('name'));
                                                });
                                            myData.push([firstPage, authors.substring(1)]);
                                            myData.push([firstPage, record.get('placePublished')]);
                                            myData.push([firstPage, record.getTimePeriod()]);
                                            this.sstore.loadData(myData);
                                        }
                                });
                                
                                record.bookLanguages().load({
                                        scope   : this,
                                        callback:function(records, operation, success) 
                                        {
                                            var languages='';
                                            Ext.Array.each(records, function(record) 
                                                {
                                                    languages += (', '+record.get('languageName'));
                                                });
                                            myData.push([firstPage, languages.substring(1)]);
                                            this.sstore.loadData(myData);
                                        }
                                });
                            }, this);
                            this.sstore.loadData(myData);
                            
                        }
                    });
         var viewer = this.viewer;
         Ext.util.Format.bookName = function(firstPage) 
            {
                var rec = store.findRecord('firstPage',firstPage);
                var lastPage = rec.get('lastPage');
                var currentPage = viewer.getPage()+1;
                if (currentPage >= firstPage && currentPage <= lastPage)
                    {
                        return '<span style="color: #000000;">' + rec.get('title') + '</span>';
                    }
                else
                    {
                        return rec.get('title');
                    }
            }
        this.viewer.getEventDispatcher().bind('pagechange', this, function()
        {
            this.down('grid').getView().refresh();
        });
    }
});

Ext.define('Ext.ux.InformationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.informationpanel',
    
    initComponent: function()
    {
        var defConfig = {
            border: false,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'bindinginformationpanel',
                title: 'Book Information',
                //collapsed: false,
                collapsible: true,
                viewer: this.viewer,
                minHeight: 200,
                flex: 1
            },{
                xtype: 'navigationpanel',
                //collapsed: false,
                collapsible: true,
                viewer: this.viewer,
                //height: '60%'
                flex: 3
             },{
                xtype: 'referencespanel',
                title: 'References',
                collapsed: true,
                collapsible: true,
                viewer: this.viewer,
                //height: '20%'
                flex: 1
            }],
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
