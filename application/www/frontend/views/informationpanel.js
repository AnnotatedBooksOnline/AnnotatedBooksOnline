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
        this.infoPanelStore = Ext.create('Ext.data.ArrayStore', 
        {
            fields: [
                {name: 'firstPage'},
                {name: 'property'}
            ],
            groupField: 'firstPage'
        });
        
        //Method to render grouping header
        Ext.util.Format.bookName = function(firstPage, parent) 
        {
            //Get the viewer
            var view = Ext.getCmp(parent.rows[0].viewId);
            var viewer = view.up('bindinginformationpanel').viewer;
            
            //Find the first and last pages of the current book
            var rec = viewer.getBinding().getModel().books().findRecord('firstPage',firstPage);
            var lastPage = rec.get('lastPage');
            
            //Get the current page
            var currentPage = viewer.getPage()+1;
            
            //Mark the currently selected book
            if (currentPage >= firstPage && currentPage <= lastPage)
            {
                return '<span style="white-space: normal;color: #000000;">' + rec.get('title') + '</span>';
            }
            else
            {
                return '<span style="white-space: normal;">' + rec.get('title') + '</span>';
            }
        }
        
        var defConfig = {
            border: false,
            flex: 1,
            autoHeight: true,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            buttons: [{
                xtype: 'button',
                text: 'Modify binding',
                name: 'modifybindingbutton',
                handler: function()
                {
                    Application.getInstance().gotoTab(
                        'upload', 
                        [this.up('bindinginformationpanel').bindingModel.get('bindingId')], 
                        true);
                }
            },{
                xtype: 'button',
                text: 'Delete binding',
                name: 'deletebindingbutton',
                handler: function()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Deletes the binding afterwards.
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to delete this binding, this can not be undone. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                        {
                            if (button == 'yes')
                            {
                                // Ban the user.
                                RequestManager.getInstance().request(
                                        'Binding',
                                        'delete',
                                        {bindingId: _this.bindingModel.get('bindingId')},
                                        _this,
                                        function()
                                        {
                                            Application.getInstance().viewport.closeTab();
                                        }
                                );
                            }
                        }
                    });  
                }
            }],
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
                    summaryType: function(records) {
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
        
        // Handle authentication changes.
        Authentication.getInstance().getEventDispatcher().bind('modelchange', this, this.onAuthenticationChange);
        
        // Update the panel according to the current authentication.
        this.onAuthenticationChange();
        
    },
    onAuthenticationChange: function()
    {
        if (Authentication.getInstance().hasPermissionTo('change-book-info'))
        {
            this.down("[name=modifybindingbutton]").setVisible(true);
            this.down("[name=deletebindingbutton]").setVisible(true);
        }
        else
        {
            this.down("[name=modifybindingbutton]").setVisible(false);
            this.down("[name=deletebindingbutton]").setVisible(false);
        }
        
        // TODO : Make the layout correctly expand.
        
        //this.up('[name=informationpanel]').doLayout();
    },
    afterRender: function()
    {
        this.callParent();
        var myData = [];
        this.bindingModel.books().each(function(book)
        {
            //Fetch all book data.
            var firstPage = book.get('firstPage');
            
            var authors = '';
            book.authors().each(function(author)
            {
                authors += (', '+author.get('name'));
            });
            
            var version = book.get('printVersion');
            
            var bookLanguages ='';
            book.bookLanguages().each(function(bookLanguage)
            {
                bookLanguages += (', '+bookLanguage.get('languageName'));
            });
            
            var placePublished = book.get('placePublished');

            
            if(authors==='')
            {
                authors = ' Unknown author(s)';
            }
            
            if(version==='')
            {
                version = 'Unknown version';
            }
            
            if(placePublished==='')
            {
                placePublished = 'Unknown publication place';
            }
            
            //Add the book to the grouping grid.
            myData.push([firstPage, authors.substring(1)]);
            myData.push([firstPage, version]);
            myData.push([firstPage, placePublished]);
            myData.push([firstPage, book.getTimePeriod()]);
            myData.push([firstPage, bookLanguages.substring(1)]);
        });
        
        this.infoPanelStore.loadData(myData);
        
        var viewer = this.viewer;
        
        //Update grid when page changes
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
            name: 'informationpanel',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            autoScroll: true,
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
                autoScroll: true,
                viewer: this.viewer,
                //height: '60%'
                flex: 3
             },{
                xtype: 'referencespanel',
                title: 'References',
                collapsed: true,
                collapsible: true,
                autoScroll: true,
                viewer: this.viewer,
                //height: '20%'
                flex: 1
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

