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
        var bindingId = 1;
        
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
        var bindingId = 1;
        this.store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
        this.store.filter({property: 'bindingId', value: bindingId});
        this.store.load();
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
                store: this.store,
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
                    dataIndex: 'filename'
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
 
var i = -1;
var book
var bookstore;
var tempPage;
 
Ext.define('Ext.ux.SelectBookForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.selectbookform',
    
    initComponent: function() 
    {
        var _this = this;
        var bindingId=1;
        bookstore = Ext.create('Ext.data.Store', {model: 'Ext.ux.BookModel'});
                    bookstore.filter({property: 'bindingId', value: bindingId});
                    bookstore.load();
        
        var defConfig = {
            monitorValid: true,
            items: [{
                xtype: 'bindinginformationfieldset'
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
                    
                    if (i===-1)
                    {
                        bookstore.each(function(record)
                        {
                            record.set('firstPage',-1);
                            record.set('lastPage',-1);
                        });
                        i=0;
                    }
                    
                    if (selection.hasSelection())
                    {
                        book=selection.getSelection()[0];
                        if(book.get('firstPage')!=-1)
                        {
                            var j;
                            for(j=book.get('firstPage');j <= book.get('lastPage');j++)
                            {
                                _this.changeBookTitle(j,'');
                            }
                        }
                        i=1;
                        this.disable();
                        selection.deselectAll();
                        grid.disable();
                        Ext.Msg.show({
                            title: 'Select starting page',
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
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    //React accordingly when a scan is double clicked
    updateForm: function(filename,page)
    {
        if (i===0)
        {
            Ext.Msg.show({
                title: 'No book selected',
                msg: 'You should first select a book.',
                buttons: Ext.Msg.OK});
                return;
        }
        if (i===1)
        {
            tempPage = page;
            //TODO improve this
            if(this.down('scanlistfieldset').store.findRecord('page',page).get('bookTitle')==''||this.down('scanlistfieldset').store.findRecord('page',page).get('bookTitle')==undefined)
                this.changeBookTitle(page, book.get('title'));
            i=2;
            return;
        }
        if (i===2)
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
            
            var bool = true;
            bookstore.each(function(record)
            {
                if(record.get('bookId')!=book.get('bookId')&&(record.get('firstPage')<=last&&record.get('lastPage')>=last||record.get('firstPage')<=first&&record.get('lastPage')>=first))
                {
                    bool = false;
                }
            });
            
            if(bool)
            {
                book.set('lastPage', last);
                book.set('firstPage', first);
            }
            else
            {
                Ext.Msg.show({
                title: 'Error',
                msg: 'Books can not overlap. Please reselect a book and try again',
                buttons: Ext.Msg.OK});
                this.changeBookTitle(tempPage,'');
            }
            
            if(book.get('firstPage')!=-1)
            {
                var j;
                for(j=book.get('firstPage');j <= book.get('lastPage');j++)
                {
                    this.changeBookTitle(j,book.get('title'));
                }
            }
            
            this.down('button').enable();
            this.down('booklistfieldset').down('grid').enable();
            this.down('booklistfieldset').down('grid').getSelectionModel().deselectAll();
            i=0;
        }
    },
    
    //True when all books have first and last pages.
    allPagesFilled: function()
    {
        var result=true;
        bookstore.each(function(record)
        {
            if(record.get('firstPage')<0||record.get('lastPage')<0)
            {
                result=false;
            }
        });
        return result;
    },
    
    //Change the booktitle of a scan in the scanlistField
    changeBookTitle: function(page, booktitle)
    {
        this.down('scanlistfieldset').store.findRecord('page',page).set('bookTitle',booktitle);
    },
    
    submit: function()
    {
        //Put the changes into an array
        var fields = new Array();
        bookstore.each(function(record)
        {
            var bookId=record.get('bookId');
            var firstPage=record.get('firstPage');
            var lastPage=record.get('lastPage');
            fields.push([bookId,firstPage,lastPage]);
        });
        
        // Send the changes to the database
        var onSuccess = function(data)
        {
                Ext.Msg.show({
                title: 'Error',
                msg: 'The data was succesfully added to the system.',
                buttons: Ext.Msg.OK}); 
                this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
           Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to save the first page and last page data. Please try again.',
                buttons: Ext.Msg.OK}); 
        };
        
        RequestManager.getInstance().request('Book', 'firstLastPages', fields, this, onSuccess, onFailure);
    }
});
