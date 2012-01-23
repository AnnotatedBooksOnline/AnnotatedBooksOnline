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
            items: [{
                xtype: 'grid',
                border: false,
                store: this.store,
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
                },{
                    text:      'Status',
                    width:     150,
                    flex:      1,
                    sortable:  false,
                    dataIndex: 'status'
                }],
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
        
        Ext.override(Ext.selection.RowModel, {
            onRowMouseDown: function (view, record, item, index, e) {
            this.selectWithEvent(record, e);
            }
        });
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
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
                book.set('timePeriod', book.getTimePeriod());

                var authors = '';
                    
                book.authors().load({
                    scope: _this,
                    callback: function(records, operation, success)
                    {
                        Ext.Array.each(records, function(record)
                        {
                            authors += (', ' + record.get('name'));
                        });
                          
                        book.set('author', authors.substring(1));
                    }
                });
            });
        });
            
        this.bookstore.load();
        

        var defConfig = {
            monitorValid: true,
            items: [{
                xtype: 'bindinginformationfieldset',
            },{
                xtype: 'booklistfieldset',
                store: _this.bookstore
            },{
                xtype: 'button',
                text: 'Start selecting the first and last pages of the currently selected book',
                width: 140,
                margin: '0 0 10 0',
                handler: function()
                {
                    var grid = this.up('selectbookform').down('booklistfieldset').down('grid');
                    var selection = grid.getSelectionModel();
                    
                    if (selection.hasSelection())
                    {
                        var book = selection.getSelection()[0];
                        _this.book = selection.getSelection()[0];
                        
                        if (book.get('firstPage') !== -1)
                        {
                            for (var j = book.get('firstPage'); j <= book.get('lastPage'); j++)
                            {
                                _this.changeBookTitle(j, undefined);
                            }
                            
                            book.set('status', '');
                        }

                        _this.i = 1;
                        
                        this.disable();
                        selection.deselectAll();
                        grid.disable();
                        
                        Ext.Msg.show({
                            title: 'Select pages',
                            msg: 'You should now select the starting and ending page of \''
                                + book.get('title') + '\' by double clicking',
                            buttons: Ext.Msg.OK
                        });
                    }
                    else
                    {
                        Ext.Msg.show({
                            title: 'No book selected',
                            msg: 'You should first select a book and press the button',
                            buttons: Ext.Msg.OK});
                    }
                } 
            },{
                xtype: 'scanlistfieldset',
                store: _this.scanstore
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
                name: 'dropUpload',
                text: 'Drop current upload',
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: ' All uploaded data will be lost. Are you sure you want to drop this upload?.',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    _this.drop();
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
        // When the user hasnt selected a book yet.
        if (this.i === 0)
        {
            Ext.Msg.show({
                title: 'No book selected',
                msg: 'You should first select a book.',
                buttons: Ext.Msg.OK
            });
        }
        
        // When the user has to select the start page.
        else if (this.i === 1)
        {
            this.changeBookTitle(page, this.book.get('title'));
            this.startOfRange = page;
            this.i = 2;

            this.endSelecting();
        }
        
        // When the user has to select the end page.
        else if (this.i === 2)
        {
            this.changeBookPageRange(this.book, this.startOfRange, page);
            this.i = 0;
            
            this.endSelecting();
        }
    },
    
    endSelecting: function()
    {
        this.down('button').enable();
        this.down('booklistfieldset').down('grid').enable();
        this.down('booklistfieldset').down('grid').getSelectionModel().deselectAll();
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
        
        // Adjust the page ranges of all books for the binding so that there is no overlap.
        this.bookstore.each(function(record)
        {
            if (record !== book) {

                if (record.get('firstPage') > firstPage && record.get('lastPage') < lastPage)
                {
                    record.set('firstPage', -1);
                    record.set('lastPage', -1);
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
    
    drop: function()
    {
        // Send the drop request to the database
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The upload was dropped.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to drop the upload. Please try again.',
                buttons: Ext.Msg.OK
            }); 
        };
        RequestManager.getInstance().request(
                'BindingUpload', 
                'dropUpload', 
                {
                    bindingId:this.bindingId
                },
                this, 
                onSuccess, 
                onFailure);
    }
});
