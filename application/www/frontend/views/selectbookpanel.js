/*
 * Book list fieldset class.
 */
Ext.define('Ext.ux.BookListFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.booklistfieldset',
    title: 'Books',
    collapsible: true,
    
    initComponent: function()
    {
        var _this = this;
        
        // TODO: get from database.
        var bindingId = 0;
        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });
        
        //store.load();
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
                //store: store,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    text:      'Title',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'title'
                },{
                    text:      'Time period',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'timePeriod'
                },{
                    text:      'Author',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'author'
                },{
                    text:      'Languages',
                    width:     250,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'languages'
                },{
                    text:      'Publisher',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'publisher'
                },{
                    text:      'Place published',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'placePublished'
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Scan list fieldset class.
 */
Ext.define('Ext.ux.ScanListFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.scanlistfieldset',
    title: 'Scans',
    collapsible: false,
    
    initComponent: function()
    {
        var _this = this;
        
        // TODO: get from database.
        var bindingId = 0;
        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });
        
        //store.load();
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
                autoScroll: true,
                //store: store,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    text:      'Page number',
                    width:     50,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'pageNumber'
                },{
                    text:      'Filename',
                    width:     250,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'filename'
                },{
                    text:      'Book title',
                    width:     250,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'title'
                }]
            }],
            listeners: {
                itemclick: function(view, record)
                {
                    var filename = record.get('filename')
                    // TODO: give signal to button with filename.
                }
            }
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Select book form class.
 */
Ext.define('Ext.ux.SelectBookForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.selectbookform',
    
    initComponent: function() 
    {
        var _this = this;
        
        // TODO: get from database
        var bookTitle = 'A book title';
        
        var defConfig = {
            items: [{
                xtype: 'bindinginformationfieldset'
            },{
                xtype: 'booklistfieldset'
            },{
                xtype: 'button',
                text: 'Select book \'' + bookTitle + '\'',
                width: 140,
                margin: '0 0 10 0',
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Select starting page',
                        msg: 'You should now select the <b>starting</b> page of \'' 
                            + bookTitle + '\'',
                        buttons: Ext.Msg.OKCANCEL,
                        callback: function()
                            {
                                // TODO
                                    
                                Ext.Msg.show({
                                    title: 'Select ending page',
                                    msg: 'You should now select the <b>ending</b> page of \''
                                        + bookTitle + '\'',
                                    buttons: Ext.Msg.OKCANCEL,
                                    callback: function()
                                        {
                                            // TODO
                                            // Disable button after last book.
                                        }
                                });
                            }
                    });
                }
            },{
                xtype: 'scanlistfieldset'
            }],
            
            submitButtonText: 'Save'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        // TODO
    }
});
