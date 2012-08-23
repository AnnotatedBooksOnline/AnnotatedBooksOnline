/*
 * Binding information panel class.
 */

Ext.define('Ext.ux.BindingInformationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.bindinginformationpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        this.bindingModel = this.viewer.getBinding().getModel();
        
        this.infoPanelStore = Ext.create('Ext.data.ArrayStore', {
            fields: [
                {name: 'firstPage'},
                {name: 'property'}
            ],
            groupField: 'firstPage'
        });
        
        // Renders grouping header.
        Ext.util.Format.bookName = function(firstPage, parent) 
        {
            // Get the viewer.
            var view = Ext.getCmp(parent.rows[0].viewId);
            var viewer = view.up('bindinginformationpanel').viewer;
            
            // Find the first and last pages of the current book.
            var rec = viewer.getBinding().getModel().books().findRecord('firstPage', firstPage);
            if (rec === null)
            {
                return '<span style="white-space: normal;">Unknown book</span>';
            }
            
            var lastPage = rec.get('lastPage');
            
            // Get the current page.
            var currentPage = viewer.getPage()+1;
            
            // Mark the currently selected book.
            if (currentPage >= firstPage && currentPage <= lastPage)
            {
                return '<span style="white-space: normal;color: #000000;">' + escape(rec.get('title')) + '</span>';
            }
            else
            {
                return '<span style="white-space: normal;">' + escape(rec.get('title')) + '</span>';
            }
        }
        
        var defConfig = {
            layout: 'fit',
            border: false,
            flex: 1,
            autoHeight: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'grid',
                name: 'grid',
                scroll: false,
                viewConfig: {
                    style: {
                        overflow: 'auto',
                        overflowX: 'hidden'
                    }
                },
                flex: 1,
                border: false,
                store: this.infoPanelStore,
                hideHeaders: true,
                
                features: [{
                    ftype: 'groupingsummary',
                    groupHeaderTpl: '{name:bookName(parent)}',
                    startCollapsed: true
                }],
                columns: [{
                    dataIndex: 'property',
                    flex: 1, 
                    summaryType: function(records)
                    {
                        if (records[0].get('firstPage') === null)
                        {
                            return '<span>Page unknown</span>';
                        }
                        return '<span style="color: (255,0,0);"> Page '
                               + records[0].get('firstPage') + '</span>';
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
        this.bindingModel.books().each(function(book)
        {
            // Fetch all book data.
            var firstPage = book.get('firstPage');
            
            var authors = '';
            book.authors().each(function(author)
            {
                authors += (', '+author.get('name'));
            });
            
            var version = book.get('printVersion');
            
            var bookLanguages = '';
            book.bookLanguages().each(function(bookLanguage)
            {
                bookLanguages += (', ' + bookLanguage.get('languageName'));
            });
            
            var placePublished = book.get('placePublished');
            
            if (authors === '')
            {
                authors = ' Unknown author(s)';
            }
            
            if (version === '')
            {
                version = 'Unknown version';
            }
            
            if (placePublished==='')
            {
                placePublished = 'Unknown publication place';
            }
            
            // Add the book to the grouping grid.
            myData.push([firstPage, authors.substring(1)]);
            myData.push([firstPage, version]);
            myData.push([firstPage, placePublished]);
            myData.push([firstPage, book.getTimePeriod()]);
            myData.push([firstPage, bookLanguages.substring(1)]);
        });
        
        this.infoPanelStore.loadData(myData);
        
        var viewer = this.viewer;
        
        // Update grid when page changes.
        this.viewer.getEventDispatcher().bind('pagechange', this, function()
        {
            this.down('grid').getView().refresh();
        });
    }
});

