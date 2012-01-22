/*
 * Binding fieldset class.
 */
Ext.define('Ext.ux.BindingFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bindingfieldset',
    title: 'Binding',
    collapsible: true,
    initComponent: function()
    {
        var _this = this;
        
        function uniqueLibrarySignature(library, signature) 
        {
            RequestManager.getInstance().request(
                'BindingUpload',
                'uniqueLibrarySignature',
                {
                	library: library.getValue(), 
                 	signature: signature.getValue(),
                 	bindingId: _this.existingBinding !== undefined ? _this.existingBinding.bindingId : '-1'
                },
                this,
                function(data)
                {
                    if (!data)
                    {
                        signature.markInvalid('The combination of library and signature is not ' +
                                              'unique in our system.');
                        library.markInvalid('The combination of library and signature is not '+ 
                                            'unique in our system.');
                    }
                }
            );
        };
        
        var annotationStore = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.LanguageModel',  
            pageSize : 250,
            sorters : {
                property : 'languageName',
                direction: 'ASC'
            }
        });
    	
        annotationStore.load();
                
        var defConfig = {
            items: [{
                xtype: 'container',
                anchor: '100%',
                layout: 'column',
                items: [{
                    xtype: 'container',
                    columnWidth: .5,
                    layout: 'anchor',
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Library *',
                        name: 'library',
                        anchor: '98%',
                        labelAlign: 'top',
                        //value: this.existingBinding !== undefined ? this.existingBinding.model.get('library')['libraryName'] : '',
                        validator: function(library)
                        {
                            var signature = _this.down('[name=signature]');
                            if (signature == null)
                            {
                                return true;
                            }
                            else 
                            {
                                uniqueLibrarySignature(this, signature);
                                return true;
                            }
                        }
                    },{
                        fieldLabel: 'Provenance',
                        name: 'provenance',
                        anchor: '98%',
                        labelAlign: 'top',
                        allowBlank: true
                    }]
                },{ 
                    xtype: 'container',
                    columnWidth: .5,
                    layout: 'anchor',
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Signature *',
                        name: 'signature',
                        anchor: '100%',
                        labelAlign: 'top',
                        validator: function(signature)
                        {
                            var library = _this.down('[name=library]');
                            if (library == null)
                            {
                                return true;
                            }
                            else 
                            {
                                uniqueLibrarySignature(library, this);
                                return true;
                            }
                        }
                    },{
                        xtype: 'combobox', 
                        fieldLabel: 'Languages of annotations',
                        name: 'languagesofannotations',
                        mode: 'local',
                        anchor: '100%',
                        labelAlign: 'top',
                        store: annotationStore,
                        displayField: 'languageName',
                        valueField: 'languageId',
                        multiSelect: true,
                        allowBlank: true,
                        forceSelection: true,
                        editable: false,
                        listeners: {
                            specialkey: function(field, e)
                            {
                                if (e.getKey() == e.BACKSPACE)
                                {
                                    e.preventDefault();
                                }
                            }
                        }
                    }]   
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // Determine if an existing binding is modified. If this is the case display the existing
        // binding fields in the form.
        if (this.existingBinding !== undefined) {
        	var existingBindingModel = this.existingBinding.model;
        
        	var provenances = "";
        	existingBindingModel.provenancesStore.each(function(provenance)
            {
        		if (provenances !== "") 
        		{
        			provenances = provenances + ", ";
        		}
        		provenances = provenances + provenance.get('name');
            });
        	
        	var languageIds = [];
        	existingBindingModel.bindingLanguagesStore.each(function(language)
            {
        		languageIds.push(language.get('languageId'));
            });
            
            this.down('[name=library]').setValue(existingBindingModel.get('library')['libraryName']);
            this.down('[name=signature]').setValue(existingBindingModel.get('signature'));
            this.down('[name=provenance]').setValue(provenances);
            this.down('[name=languagesofannotations]').setValue(languageIds);

        }
        
    },
    
    getBinding: function()
    {
        return {
        	bindingId: this.existingBinding !== undefined ? this.existingBinding.bindingId : '-1',
            library: this.down('[name=library]').getValue(),
            provenance: this.down('[name=provenance]').getValue(),
            signature: this.down('[name=signature]').getValue(),
            languagesofannotations: this.down('[name=languagesofannotations]').getValue()
        };
    }
});

/*
 * Book fieldset class (one book).
 */
Ext.define('Ext.ux.BookFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bookfieldset',
    title: 'Book: ?',
    collapsible: true,
    initComponent: function() {
        var _this = this;
    
        var booklanguageStore = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.LanguageModel',  
            pageSize : 250,
            sorters : {
                property : 'languageName',
                direction: 'ASC'
            }
        });
        booklanguageStore.load();
        
        var defConfig = {
            items: [{
                xtype: 'container',
                anchor: '100%',
                layout: 'column',
                    items: [{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Title *',
                            name: 'title',
                            anchor: '98%',
                            labelAlign: 'top',
                            height: 42,
                            listeners: {
                                'change': function(t, title)
                                {
                                    if (title == "")
                                    {
                                        _this.setTitle('Book: ?');
                                    }
                                    else
                                    {
                                        _this.setTitle('Book: ' + title);
                                    }
                                }
                            }
                        },{
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            fieldLabel: 'Time period of publication *',
                            anchor: '100%',
                            labelAlign: 'top',
                            height: 42,
                            items: [{
                                xtype: 'numberfield',
                                name: 'from',
                                width: 63,
                                minLength: 4,
                                maxLength: 4,
                                minValue: 1000,
                                allowDecimals: false,
                                listeners: {
                                    'blur': function(from, f)
                                    {
                                        var to = this.nextSibling('[name=to]');
                                        var fromValue = from.getValue();
                                        var toValue = to.getValue()
                                        if (toValue == null || parseInt(fromValue) > parseInt(toValue)) 
                                        {
                                            to.setValue(fromValue);
                                        }
                                        return;
                                    },
                                    'spin': function(from, direction)
                                    {
                                        var to = this.nextSibling('[name=to]');
                                        var fromValue = parseInt(from.getValue());
                                        var toValue = parseInt(to.getValue());
                                        
                                        if (direction=='up')
                                        {
                                            fromValue++;
                                        }
                                        else
                                        {
                                            fromValue--;
                                        }
                                        
                                        if (to.getValue() == null || fromValue > toValue) 
                                        {
                                            to.markInvalid('This value should be equal to or' +
                                                           ' greater than the first value.');
                                            _this.up('form').getForm().markInvalid();
                                        }
                                        else
                                        {
                                            to.validate();
                                        }
                                        
                                        return;
                                    }
                                }
                            },{
                                xtype: 'label',
                                text: '-',
                                margins: '0 0 0 10'
                            },{
                                xtype: 'numberfield',
                                hideLabel: true,
                                name: 'to',
                                width: 63,
                                minLength: 4,
                                maxLength: 4,
                                minValue: 1000,
                                allowDecimals: false,
                                margins: '0 0 0 10',
                                listeners: {
                                    'blur': function(to, t)
                                    {
                                        var from = this.previousSibling('[name=from]');
                                        var fromValue = from.getValue();
                                        var toValue = to.getValue();
                                        if (fromValue == null || parseInt(fromValue) > parseInt(toValue)) 
                                        {
                                            from.setValue(toValue);
                                        }
                                        return;
                                    },
                                    'spin': function(to, direction)
                                    {
                                        var from = this.previousSibling('[name=from]');
                                        var fromValue = parseInt(from.getValue());
                                        var toValue = parseInt(to.getValue());
                                        
                                        if (direction=='up')
                                        {
                                            toValue++;
                                        }
                                        else
                                        {
                                            toValue--;
                                        }
                                        
                                        if (from.getValue() == null || fromValue > toValue) 
                                        {
                                            from.markInvalid('This value should be equal to or' +
                                                             ' lower than the second value.');
                                            _this.up('form').getForm().markInvalid();
                                        }
                                        else
                                        {
                                            from.validate();
                                        }
                                        
                                        return;
                                    }
                                }
                            }]
                        },{
                            xtype: 'combobox', 
                            fieldLabel: 'Languages *',
                            name: 'languages',
                            mode: 'local',
                            multiSelect: true,
                            store: booklanguageStore,
                            displayField: 'languageName',
                            valueField: 'languageId',
                            anchor: '98%',
                            labelAlign: 'top',
                            editable: false,
                            height: 42,
                            forceSelection: true,
                            listeners: {
                                specialkey: function(field, e)
                                {
                                    if (e.getKey() == e.BACKSPACE)
                                    {
                                        e.preventDefault();
                                    }
                                }   
                            }
                        },{
                            fieldLabel: 'Publisher/printer',
                            name: 'publisher',
                            anchor: '98%',
                            allowBlank: true,
                            height: 42,
                            labelAlign: 'top'
                        }]
                    },{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Author',
                            name: 'author',
                            anchor: '100%',
                            allowBlank: true,
                            height: 42,
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Place published',
                            name: 'placePublished',
                            anchor: '100%',
                            allowBlank: true,
                            height: 42,
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Version',
                            name: 'version',
                            anchor: '100%',
                            allowBlank: true,
                            height: 42,
                            labelAlign: 'top'
                        }]
                    }]
                },{
                    xtype: 'button',
                    text: 'Delete book',
                    name: 'deletebook',
                    disabled: true,
                    width: 140,
                    margin: '5 0 10 0',
                    handler: function()
                    {
                        _this.up('booksfieldset').checkBooks(true);
                        _this.destroy();
                    }
                }]
            };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // Determine if an existing book is modified. If this is the case display the existing
        // book fields in the form.
        if (this.existingBook !== undefined) {

        	var languageIds = [];
        	this.existingBook.bookLanguagesStore.each(function(language)
            {
        		languageIds.push(language.get('languageId'));
            });
        	
        	
            var authors = "";
            this.existingBook.authorsStore.each(function(author)
            {
        		if (authors !== "") 
        		{
        			authors = authors + ", ";
        		}
        		authors = authors + author.get('name');
            });

            this.down('[name=title]').setValue(this.existingBook.get('title'));
            this.down('[name=from]').setValue(this.existingBook.get('minYear'));
            this.down('[name=to]').setValue(this.existingBook.get('maxYear'));
            this.down('[name=publisher]').setValue(this.existingBook.get('publisher'));
            this.down('[name=author]').setValue(authors);
            this.down('[name=placePublished]').setValue(this.existingBook.get('placePublished'));
            this.down('[name=version]').setValue(this.existingBook.get('version'));
            this.down('[name=languages]').setValue(languageIds);
 
        }
    },
    
    getBook: function()
    {
        // TODO: How is this a book value? Create a book entity.
        
        return {
        	bookId: this.existingBook !== undefined ? this.existingBook.get('bookId') : '-1',
            title: this.down('[name=title]').getValue(),
            author: this.down('[name=author]').getValue(),
            publisher: this.down('[name=publisher]').getValue(),
            minYear: this.down('[name=from]').getValue(),
            maxYear: this.down('[name=to]').getValue(),
            languages: this.down('[name=languages]').getValue(),
            placePublished: this.down('[name=placePublished]').getValue(),
            printVersion: this.down('[name=version]').getValue()
        };
    }
});

/*
 * Books fieldset class (more books).
 */

Ext.define('Ext.ux.BooksFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.booksfieldset',
    title: 'Books',
    collapsible: true,
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                xtype: 'button',
                text: 'Add book',
                width: 140,
                margin: '0 0 10 0',
                handler: function()
                {
                    this.ownerCt.insert(this.ownerCt.items.length - 1, [{xtype: 'bookfieldset'}]);
                    _this.checkBooks(false);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // Determine if an existing binding is modified. If this is the case display the existing
        // binding fields in the form.
        if (this.existingBinding !== undefined) 
        {
        	// Insert a fieldset for every book in the existing book that is being modified.
        	this.existingBinding.model.booksStore.each(function(book)
            {
        		_this.insert(_this.items.length - 1, 
        			[{
        				xtype: 'bookfieldset',
        				existingBook: book
        			}]);
            });
        }
        else
        {
        	// Insert a blank set of books fields when a new book is being uploaded.
        	this.insert(this.items.length - 1, [{xtype: 'bookfieldset'}]);
        }
        
    },
    
    getBooks: function()
    {
        var books = [];
        var current = this.down('bookfieldset');
        
        do
        {
            books.push(current.getBook());
        } while (current = current.nextSibling('bookfieldset'));
        
        return books;
    },
    
    checkBooks: function(deleted)
    {
        var books = this.getBooks();
        var disable = false;
        
        if (books.length == 1 || (deleted && books.length == 2))
        {
            disable = true;
        }
        
        var current = this.down('bookfieldset');
        
        do
        {
            current.down('[name=deletebook]').setDisabled(disable);
        } while (current = current.nextSibling('bookfieldset'));
    },
    
    reset: function()
    {
        var books = this.getBooks();
        if (books.length > 1)
        {
            var current = this.down('bookfieldset');
            var next = current.nextSibling('bookfieldset');
            
            for (var i = 0; i < books.length - 1; i++)
            {
                current = next;
                next = current.nextSibling('bookfieldset');
                current.destroy();
            }
            
            this.checkBooks();
        }
    }
});

/*
 * Upload form class.
 */
Ext.define('Ext.ux.UploadForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.uploadform',
    
    initComponent: function() 
    {
        var _this = this;
        
        // Determine if the user is adding a new binding. If this is the case determine if the
        // there is no existing pending binding for the user.
        if (this.existingBinding === undefined)
        {
        
        	RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this, 
        			function(result)
        			{
                		if (result['status'] === 2)
                		{
                			// TODO: What to do here?
                		}
                		else
                		{
                			Ext.Msg.show({
                				title: 'Error',
                				msg: 'This step of the uploading process is currently unavailable',
                				buttons: Ext.Msg.OK
                			});
                    
                			this.up('[name=upload]').close();
                		}
        			}, 
        			function()
        			{
        				Ext.Msg.show({
        					title: 'Error',
        					msg: 'There is a problem with the server. Please try again later',
        					buttons: Ext.Msg.OK
        				});
                
        				this.up('[name=upload]').close();
        			});
        }
        
        var defConfig = {
            name: 'uploadform',
            items: [{
                xtype: 'scanpanel'
            },{
                xtype: 'bindingfieldset',
                existingBinding : this.existingBinding
            },{
                xtype: 'booksfieldset',
                existingBinding : this.existingBinding
            }],
            
            listeners: {
                validitychange: function(form, valid)
                    {
                        var booksfieldset = this.down('booksfieldset');
                        var books = booksfieldset.getBooks();
                        
                        var current = booksfieldset.down('bookfieldset');
                        do {
                            current.down('[name=deletebook]').setDisabled(valid);
                        } while (current = current.nextSibling('bookfieldset'));
                    }
            },
            
            buttons: [{
                xtype: 'button',
                text: 'Reset',
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to reset the complete form. Data will be lost and ' +
                             'this action can\'t be undone. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                        {
                            if (button == 'yes')
                            {
                                _this.reset();
                            }
                        }
                    });
                }
            },{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Save',
                width: 140,
                handler: function()
                {
                    _this.setLoading('Uploading...');
                    _this.checkIntervalId = setInterval(function() { _this.checkCompleted(); }, 1000);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    checkCompleted: function()
    {
        var scans = this.down('scanpanel').getValues();
        var waiting = false;
        var successScans = 0;
        for (var i = 0; i < scans.length; i++)
        {
            if (scans[i].status == 'success')
            {
                successScans++;
            }
            else if (scans[i].status == 'error')
            {
                this.setLoading(false);
                this.setLoading('Some scans failed to upload. Please reselect them.');
                
                waiting = true;
                break;
            }
            else
            {
                waiting = true;
                break;
            }
        }
        
        if (!waiting)
        {
            var binding = this.down('bindingfieldset').getBinding();
            var books = this.down('booksfieldset').getBooks();
            var result = {binding: binding, books: books, scans: scans};
            var numberOfBooks = books.length;
            
            if (numberOfBooks > successScans && this.existingBinding === undefined)
            {
                this.setLoading(false);
                
                if (numberOfBooks === 1) {
                    this.setLoading('There need to be at least ' + numberOfBooks
                                   + ' successfully uploaded scan, because there is '
                                   + numberOfBooks + ' book. Please add more scans.'
                                          + ' Waiting for more scans...');
                }
                else
                {
                    this.setLoading('There need to be at least ' + numberOfBooks
                                   + ' successfully uploaded scans, because there are '
                                   + numberOfBooks + ' books. Please add more scans.'
                                   + ' Waiting for more scans...');
                }
            }
            else
            {
                clearInterval(this.checkIntervalId);
                
                this.setLoading(false);
                this.setLoading('Saving...');
                
                RequestManager.getInstance().request('BindingUpload', 'upload', result, this,
                function()
                {
                    this.setLoading(false);
                    var _this = this;
                    Ext.Msg.show({
                        title: 'Upload',
                        msg: 'Binding added successfully.',
                        buttons: Ext.Msg.OK,
                        callback: function(button)
                            {
                                Application.getInstance().gotoTab('reorderscan',[_this.existingBinding],true);
                                _this.up('[name=upload]').close();
                            }
                    });
                },
                function()
                {
                    this.setLoading(false);
                    
                    return true;
                });
            }
        }
    },
    
    submit: function()
    {
        this.setLoading("Uploading...", true);
        
        var values = this.getValues();
        
        //alert(this.getValues(false));
        
        // TODO: Do something here.
    },
    
    reset: function()
    {
        this.callParent();
        
        this.down('scanpanel').reset();
        this.down('booksfieldset').reset();
    }
});
