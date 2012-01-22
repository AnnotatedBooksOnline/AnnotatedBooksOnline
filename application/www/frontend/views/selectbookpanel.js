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
                store: bookstore,
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
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
                store: scanstore,
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


// TODO: Get rid of these globals! Make them class statics, or class fields.
// TODO: This logic shouldn't even be separated over multiple main views, but one wizard view.

// TODO : mathijsB . rewrite a lot in this file.

var i = 0;
var book;
var bookstore = Ext.create('Ext.data.Store', {model: 'Ext.ux.BookModel'});
var scanstore = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
var tempPage;


Ext.define('Ext.ux.SelectBookForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.selectbookform',
    
    initComponent: function() 
    {
        var _this = this;
        

        // TODO: Implement filtering serverside, to remove second filtering.
        scanstore.filter({property: 'bindingId', value: this.bindingId});
        scanstore.load();
        bookstore.filter({property: 'bindingId', value: this.bindingId});
            
        bookstore.on('load', function()
        { 
            bookstore.each(function(book)
            {
                book.set('timePeriod', book.getTimePeriod());
                book.set('firstPage', -1);
                book.set('lastPage', -1);
                    
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
            
        bookstore.load();
        

        var defConfig = {
            monitorValid: true,
            items: [{
                xtype: 'bindinginformationfieldset',
            },{
                xtype: 'booklistfieldset',
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
                        book = selection.getSelection()[0];
                        if (book.get('firstPage') !== -1)
                        {
                            for (var j = book.get('firstPage'); j <= book.get('lastPage'); j++)
                            {
                                _this.changeBookTitle(j, undefined);
                            }
                            
                            book.set('status', '');
                        }
                        
                        i = 1;
                        
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
                xtype: 'scanlistfieldset'
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
            }],
            selectFirstField: false
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    // React accordingly when a scan is double clicked.
    updateForm: function(filename, page)
    {
        if (i === 0)
        {
            Ext.Msg.show({
                title: 'No book selected',
                msg: 'You should first select a book.',
                buttons: Ext.Msg.OK
            });
        }
        else if (i === 1)
        {
            tempPage = page;
            if(scanstore.findRecord('page', page).get('bookTitle') === undefined)
            {
                this.changeBookTitle(page, book.get('title'));
                
                i = 2;
                
                return;
            }
            
            Ext.Msg.show({
                title: 'Books overlap',
                msg: 'Books can not overlap. Please reselect a book and try again.',
                buttons: Ext.Msg.OK
            });
            
            this.endSelecting();
        }
        else if (i === 2)
        {
            var first;
            var last;
            
            if (tempPage<=page)
            {
                first = tempPage;
                last = page;
            }
            else
            {
                first = page;
                last = tempPage;
            }
            
            var bool  = true; // TODO: Rename to something meaningful.
            var title = scanstore.findRecord('page',page).get('bookTitle');
            
            bookstore.each(function(record)
            {
                if (record.get('bookId') !== book.get('bookId') &&
                   ((record.get('firstPage') <= last && record.get('firstPage') >= first) ||
                    (record.get('lastPage')  <= last && record.get('lastPage')  >= first)))
                {
                    bool = false;
                }
            });
            
            if (bool)
            {
                book.set('lastPage', last);
                book.set('firstPage', first);
                if (this.allPagesFilled())
                {
                    this.down('[name=save]').enable();
                }
            }
            else
            {
                Ext.Msg.show({
                    title: 'Books overlap',
                    msg: 'Books can not overlap. Please reselect a book and try again',
                    buttons: Ext.Msg.OK
                });
                
                this.changeBookTitle(tempPage,undefined);
            }

            this.endSelecting();
        }
    },
    
    endSelecting: function()
    {
        if (book.get('firstPage') !== -1)
        {
            for (var j = book.get('firstPage'); j <= book.get('lastPage'); j++)
            {
                this.changeBookTitle(j, book.get('title'));
            }
            
            book.set('status', 'done');
        }
        
        this.down('button').enable();
        this.down('booklistfieldset').down('grid').enable();
        this.down('booklistfieldset').down('grid').getSelectionModel().deselectAll();
        
        i = 0;
    },
    
    // Returns true when all books have first and last pages.
    allPagesFilled: function()
    {
        var result = true;
        bookstore.each(function(record)
        {
            if (record.get('firstPage') < 0 || record.get('lastPage') < 0)
            {
                result = false;
            }
        });
        
        return result;
    },
    
    // Change the booktitle of a scan in the scanlist field.
    changeBookTitle: function(page, booktitle)
    {
        scanstore.findRecord('page', page).set('bookTitle', booktitle);
    },
    
    submit: function()
    {
        // Put the changes into an array.
        var fields = [];
        bookstore.each(function(record)
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
    }
});
