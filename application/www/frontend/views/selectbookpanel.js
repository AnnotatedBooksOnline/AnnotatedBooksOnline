/*
 * Book list fieldset class.
 */
Ext.define('Ext.ux.BookListFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.booklistfieldset',
    title: 'Books',
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: 'fit',
            autoscroll: true,
            items: [{
                xtype: 'grid',
                border: false,
                store: this.store,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    text:      'Title',
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'title'
                },{
                    text:      'Status',
                    width:     75,
                    sortable:  false,
                    dataIndex: 'status'
                }],
                listeners: 
                {
                    itemclick: function(view, record)
                    {
                        this.up('selectbookform').down('bookinformationfieldset').setBook(record);
                    },
                    itemdblclick: function(view, record)
                    {
                        this.disable();
                        this.up('selectbookform').setCurrentBook(record);
                        this.up('selectbookform').down('scanlistfieldset').down('grid').enable();
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Book fieldset class.
 */
Ext.define('Ext.ux.BookInformationFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bookinformationfieldset',
    title: 'Book information',
    collapsible: true,
    initComponent: function()
    {
        var _this = this;
        
        //TODO: wrapping?
        var defConfig = {
            autoScroll: true,
            items: [{
                xtype: 'propertygrid',
                propertyNames: {
                    a: 'Title',
                    b: 'Author(s)',
                    c: 'Version',
                    d: 'Place published',
                    e: 'Publisher',
                    f: 'Time period',
                    g: 'Languages'
                },
                source: {
                    "a": ' ',
                    "b": ' ',
                    "c": ' ',
                    "d": ' ',
                    "e": ' ',
                    "f": ' ',
                    "g": ' '
                },
                listeners: {
                    // Prevent editing
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders: true,
                nameColumnWidth: 100
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    //TODO: Do this in a more elegant way
    setBook: function(book)
    {
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
        var publisher = book.get('publisher');
        
        if(authors==='')
        {
            authors = ' Unknown author(s)';
        }
        
        if(version==null)
        {
            version = 'Unknown version';
        }
        
        if(placePublished==null)
        {
            placePublished = 'Unknown publication place';
        }
        
        if(publisher==null)
        {
            publisher = 'Unknown publisher';
        }
    
        this.down('propertygrid').setSource({
                    "a": book.get('title'),
                    "b": authors.substring(1),
                    "c": version,
                    "d": placePublished,
                    "e": publisher,
                    "f": book.getTimePeriod(),
                    "g": bookLanguages.substring(1)
                });
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
        
        Ext.override(Ext.selection.RowModel, {
            onRowMouseDown: function (view, record, item, index, e) {
            this.selectWithEvent(record, e);
            }
        });
        
        var defConfig = {
            layout: 'fit',
            autoscroll: true,
            items: [{
                xtype: 'grid',
                border: false,
                disabled: true,
                store: this.store,
                resizable: false,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    text:      'Page number',
                    width:     50,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'page'
                },{
                    text:      'Filename',
                    width:     250,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'scanName'
                },{
                    text:      'Book title',
                    width:     250,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'bookTitle'
                }],
                listeners: {
                    itemdblclick: function(view, record)
                    {
                        var filename = record.get('filename');
                        var page = record.get('page');
                        this.up('selectbookform').updateForm(filename,page);
                    }
                }
            }]
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
        
        this.tempPage = undefined;
        this.book = undefined;
        this.i = 0;
        
        this.bookstore = Ext.create('Ext.data.Store', {model: 'Ext.ux.BookModel'});
        this.scanstore = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
        
        // TODO: Implement filtering serverside, to remove second filtering.
        this.scanstore.filter({property: 'bindingId', value: this.bindingId});
        this.scanstore.load();
        this.bookstore.filter({property: 'bindingId', value: this.bindingId});
            
        this.bookstore.on('load', function()
        { 
            _this.bookstore.each(function(book)
            {
                if(book.get('firstPage') === null||book.get('lastPage') === null)
                {
                    book.set('status', 'unfinished');
                }
                else
                {
                    book.set('status', 'done');
                }
                
                if (_this.allPagesFilled())
                {
                    _this.down('[name=save]').enable();
                }
                
                book.authors().load();
                book.bookLanguages().load();
            });
        });
            
        this.bookstore.load();
        

        var defConfig = {
            monitorValid: true,
            layout:'border',
            defaults: {
                collapsible: false,
                split: true
            },
            items: [{
                titlebar: false,
                region:'west',
                width: 327,
                bodyPadding: 10,
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align : 'stretch'
                    },
                items:[{
                    xtype: 'panel',
                    border: false,
                    flex: 1,
                    cls: 'plaintext',
                    html: '<h2>Instructions:</h2><p>In this screen you will need to assign the scans to the books. '
                        +'First you will need to select a book by double clicking. '
                        +'Afterwards you can select the first page and the last page'
                        +' of the book in any order by double clicking. When you have done this for all books,'
                        +'you can press the save button and the binding will be added to the database.</p>'
                    },{
                    xtype: 'booklistfieldset',
                    store: _this.bookstore,
                    flex: 1
                    },{
                    xtype: 'bookinformationfieldset',
                    store: _this.bookstore,
                    flex: 1
                    }]
            },{
                title: 'Scans',
                xtype: 'scanlistfieldset',
                store: _this.scanstore,
                collapsible: false,
                region:'center',
                margins: '5 0 0 0'
            }],
            buttons: [{
                xtype: 'button',
                disabled: true,
                name: 'save',
                text: 'Save',
                width: 140,
                handler: function()
                {
                    _this.submit();
                }
            },{
                xtype: 'button',
                name: 'delete',
                text: 'Delete',
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: ' This binding will be deleted. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    _this.deleteBinding();
                                }
                            }
                    });
                }
            }],
            selectFirstField: false
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    // React accordingly when a scan is double clicked.
    updateForm: function(filename, page)
    {
        // When the user has to select the start page.
        if (this.i === 0)
        {
            this.changeBookTitle(page, this.book.get('title'));
            this.startOfRange = page;
            this.i = 1;
        }
        
        // When the user has to select the end page.
        else if (this.i === 1)
        {
            this.changeBookPageRange(this.book, this.startOfRange, page);
            this.i = 0;
            
            this.endSelecting();
        }
    },
    
    endSelecting: function()
    {
        this.down('scanlistfieldset').down('grid').disable();
        this.down('booklistfieldset').down('grid').enable();
    },
    
    // Returns true when all books have first and last pages.
    allPagesFilled: function()
    {
        var result = true;
        this.bookstore.each(function(record)
        {
            if (record.get('firstPage') <= 0 || record.get('lastPage') <= 0)
            {
                result = false;
            }
        });
        
        return result;
    },
    
    // Changes the page range for a book.
    changeBookPageRange: function(book, firstPage, lastPage)
    {
        var _this = this;
        
        // Store the first and last page of the book.
        book.set('firstPage', firstPage);
        book.set('lastPage', lastPage);
        book.set('status', 'done');
        // Adjust the page ranges of all books for the binding so that there is no overlap.
        this.bookstore.each(function(record)
        {
            if (record !== book) {
                if (record.get('firstPage') > firstPage && record.get('lastPage') < lastPage)
                {
                    record.set('firstPage', null);
                    record.set('lastPage', null);
                    record.set('status', 'unfinished');
                    _this.down('[name=save]').disable();
                }
                else if (record.get('firstPage') < firstPage && record.get('lastPage') > firstPage)
                {
                    record.set('lastPage', firstPage - 1);
                } 
                else if (record.get('firstPage') < lastPage && record.get('lastPage') > lastPage)
                {
                    record.set('firstPage', lastPage + 1);
                }
            }
        });
        
        // Update all scan records to reflect the book they belong to.
        this.scanstore.each(function(scanrecord) {
            var title = "";
            _this.bookstore.each(function(bookrecord)
            {
                if (scanrecord.get('page') >= bookrecord.get('firstPage') 
                        && scanrecord.get('page') <= bookrecord.get('lastPage')) 
                {
                    title = bookrecord.get('title');
                }
            });
            scanrecord.set('bookTitle', title);
        });
        
        // Determine if all books have a page range set. If this is the case enable the save button.
        if (this.allPagesFilled())
        {
            this.down('[name=save]').enable();
        }
    },
    
    setCurrentBook: function(book)
    {
        this.book = book;
        if (book.get('firstPage') !== null)
        {
            for (var j = book.get('firstPage'); j <= book.get('lastPage'); j++)
            {
                this.changeBookTitle(j, null);
            }
            book.set('status', 'unfinished');
        }
    },
    
    // Change the booktitle of a scan in the scanlist field.
    changeBookTitle: function(page, booktitle)
    {
        if (page <= 0)
        {
            return;
        }
        this.scanstore.findRecord('page', page).set('bookTitle', booktitle);
    },
    
    submit: function()
    {
        // Put the changes into an array.
        var fields = [];
        this.bookstore.each(function(record)
        {
            fields.push({
                bookId: record.get('bookId'),
                firstPage: record.get('firstPage'),
                lastPage: record.get('lastPage')
            });
        });
        
        // Send the changes to the database
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The data was succesfully added to the system.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to save the first page and last page data. Please try again.',
                buttons: Ext.Msg.OK
            }); 
        };
        
        RequestManager.getInstance().request(
                'Book', 
                'firstLastPages', 
                {
                    bindingId:this.bindingId, 
                    selectedBooks:fields
                },
                this, 
                onSuccess, 
                onFailure);
    },
    
    deleteBinding: function()
    {
        // Send the drop request to the database
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The binding was successfully deleted.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to delete the binding. Please try again.',
                buttons: Ext.Msg.OK
            }); 
        };
        RequestManager.getInstance().request(
                'BindingUpload', 
                'deleteUpload', 
                {
                    bindingId:this.bindingId
                },
                this, 
                onSuccess, 
                onFailure);
    }
});
