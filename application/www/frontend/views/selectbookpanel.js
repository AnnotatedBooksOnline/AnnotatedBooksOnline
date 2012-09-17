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
            autoScroll: true,
            items: [{
                xtype: 'grid',
                border: false,
                store: this.store,
                style: 'margin-top: 5px; margin-bottom: 5px;',
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
        
        if(version==='')
        {
            version = 'Unknown version';
        }
        
        if(placePublished==='')
        {
            placePublished = 'Unknown publication place';
        }
        
        if(publisher==='')
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
            items: [{
                xtype: 'grid',
                border: false,
                store: this.store,
                resizable: false,
                disabled: true,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    text:      'Page number',
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'page'
                },{
                    text:      'Filename',
                    flex:      2,
                    sortable:  false,
                    dataIndex: 'scanName'
                },{
                    text:      'Book title',
                    flex:      2,
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
        
        this.bookstore = Ext.create('Ext.ux.StoreBase', {model: 'Ext.ux.BookModel', pageSize: 10000});
        this.scanstore = Ext.create('Ext.ux.StoreBase', {model: 'Ext.ux.ScanModel', pageSize: 10000});
        
        this.scanstore.filter('bindingId', this.bindingId);
        this.bookstore.filter('bindingId', this.bindingId);
        
        this.bookstore.on('load', function()
        { 
            _this.bookstore.each(function(book)
            {
                if (book.get('firstPage') === null||book.get('lastPage') === null)
                {
                    book.set('status', 'Unfinished');
                }
                else
                {
                    book.set('status', 'Done');
                }
                
                if (_this.allPagesFilled())
                {
                    _this.down('[name=save]').enable();
                }
                
                book.authors().load();
                book.bookLanguages().load();
            });
            
            _this.scanstore.each(function(scanrecord) {
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
            
        });
        
        // A temporary solution to the problem of accessing upload panels through url
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this,
            function(result)
            {
                if (result['status'] == 1 && result['bindingId'] == this.bindingId && this.bindingId !== undefined)
                {
                    this.scanstore.load();
                    this.bookstore.load();
                }
                else
                {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'This step of the uploading process is currently unavailable for this binding.',
                        buttons: Ext.Msg.OK
                    });
                    this.close();
                }
            },
            function()
            {
                 Ext.Msg.show({
                    title: 'Error',
                    msg: 'There is a problem with the server. Please try again later.',
                    buttons: Ext.Msg.OK
                });
                this.close();
            }
        );
        
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
                margin: '0 5 0 0',
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align : 'stretch'
                },
                items: [{
                    xtype: 'panel',
                    border: false,
                    flex: 1,
                    cls: 'plaintext',
                    html: '<h2>Instructions</h2><p>In this screen you will need to assign the scans to the books. '
                        + 'First you will need to select a book by double clicking. '
                        + 'Afterwards you can select the first page and the last page'
                        + ' of the book in any order by double clicking. When you have done this for all books,'
                        + 'you can press the save button and the binding will be added to the database.</p>'
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
                xtype: 'panel',
                region:'center',
                bodyPadding: 10,
                autoScroll: true,
                items: [{
                    xtype: 'bindinginformationfieldset',
                    bindingId: this.bindingId,
                    collapsible: false
                },{
                    title: 'Scans',
                    xtype: 'scanlistfieldset',
                    store: _this.scanstore,
                    collapsible: false,
                    layout: 'fit'
                }]
                
            }],
            buttons: [{
                xtype: 'button',
                name: 'delete',
                text: 'Delete',
                iconCls: 'cancel-icon',
                hidden: this.isExistingBinding,
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'This binding will be deleted. Are you sure?',
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
            },{
                xtype: 'button',
                disabled: true,
                name: 'save',
                text: 'Save',
                iconCls: 'accept-icon',
                width: 140,
                handler: function()
                {
                    _this.submit();
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
    changeBookPageRange: function(book, startOfRange, endOfRange)
    {
        var _this = this;
        var firstPage;
        var lastPage;
        
        //Determine what the start and the end of the range is.
        if (startOfRange <= endOfRange)
        {
            firstPage = startOfRange;
            lastPage = endOfRange;
        }
        else
        {
            firstPage = endOfRange;
            lastPage = startOfRange;
        }
        
        // Store the first and last page of the book.
        book.set('firstPage', firstPage);
        book.set('lastPage', lastPage);
        book.set('status', 'Done');
        
        // Adjust the page ranges of all books for the binding so that there is no overlap.
        this.bookstore.each(function(record)
        {
            if (record !== book) {
                if (record.get('firstPage') > firstPage && record.get('lastPage') < lastPage)
                {
                    record.set('firstPage', null);
                    record.set('lastPage', null);
                    record.set('status', 'Unfinished');
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
            book.set('status', 'Unfinished');
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
        
        // Send the changes to the database.
        var onSuccess = function(data)
        {
            // The success message depends on whether modifying an existing, or adding a new binding.
            var message;
            if(this.isExistingBinding)
            {
                message = 'The binding has been successfully modified. If you have uploaded any '
                        + 'new scans, these will now be processed and an e-mail will be send to '
                        + 'they are done. If not, the changed binding should be available '
                        + 'immediately';
            }
            else
            {
                message = 'The data was succesfully added to the system. It will now be processed. An '
                        + 'e-mail will be send to you when processing has finished and the binding has '
                        + 'become available.';
            }
            
            Application.getInstance().viewport.updateUploadButtonTitle();
            Ext.Msg.show({
                title: 'Success',
                msg: message,
                buttons: Ext.Msg.OK
            }); 
            this.close();
        };
        
        RequestManager.getInstance().request(
            'Book', 
            'firstLastPages', 
            {
                bindingId:this.bindingId, 
                selectedBooks:fields
            },
            this,
            onSuccess);
    },
    
    deleteBinding: function()
    {
        // Send the delete request to the database.
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The binding was successfully deleted.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        RequestManager.getInstance().request(
            'BindingUpload', 
            'deleteUpload', 
            {
                bindingId:this.bindingId
            },
            this,
            onSuccess
        );
    }
});
