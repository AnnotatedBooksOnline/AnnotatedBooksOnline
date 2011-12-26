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
        
        var librarySignatureCheck = true;
        
        // TODO: let this function communicate with db, define better name
        // used @ library & signature
        function checkLibrarySignature(library, signature) {
            var result = null; // TODO: getfromdb(library, signature);
            if (result === null)
            {
                return true;
            }
            else 
            {
                return 'The combination of library and signature is not unique in our system. '
                     + 'See opennewtabwithresult ' /*+ result*/ + 'for the version in our system.';
            }
        };
        
        // TODO: get this from database (this table is not yet in the model)
        var store = Ext.create('Ext.data.ArrayStore', {
            data: [['nl', 'Dutch'],['en', 'English'],['de', 'German']],
            fields: ['value', 'text'],
            sortInfo: {
                field: 'text',
                direction: 'ASC'
            }
        });
        
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
                        validator: function(library)
                        {
                            // Set signature + library false if the combination is already ina
                            // the database.
                            var signature = this.nextSibling('[name=signature]');
                            if (signature === null)
                            {
                                return true;
                            }
                            else 
                            {
                                if (librarySignatureCheck) 
                                {
                                    librarySignatureCheck = false;
                                    signature.validate();
                                    librarySignatureCheck = true;
                                }
                                
                                return checkLibrarySignature(library, signature.getValue());
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
                            // Set signature + library false if the combination is already ina
                            // the database.
                            var library = this.previousSibling('[name=library]');
                            if (library === null)
                            {
                                return true;
                            }
                            else 
                            {
                                if (librarySignatureCheck) 
                                {
                                    librarySignatureCheck = false;
                                    library.validate();
                                    librarySignatureCheck = true;
                                }
                                
                                return checkLibrarySignature(library.getValue(), signature);
                            }
                        }
                    },{
                        xtype: 'combobox', 
                        fieldLabel: 'Languages of annotations',
                        name: 'languagesofannotations',
                        mode: 'local',
                        anchor: '100%',
                        labelAlign: 'top',
                        store: store,
                        multiSelect: true,
                        allowBlank: true,
                        forceSelection: true,
                        editable: false
                    }]   
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    getBinding: function()
    {
        return {
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
    
        // TODO: get this from database.
        var store = Ext.create('Ext.data.ArrayStore', {
            data: [['nl', 'Dutch'], ['en', 'English'], ['de', 'German']],
            fields: ['value', 'text'],
            sortInfo: {
                field: 'text',
                direction: 'ASC'
            }
        });
        
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
                            fieldLabel: 'Pages *',
                            anchor: '98%',
                            labelAlign: 'top',
                            items: [{
                                xtype: 'numberfield',
                                name: 'pageStart',
                                width: 63,
                                minValue: 1,
                                allowDecimals: false,
                                listeners: {
                                    'change': function (f, start)
                                    {
                                        // On change, check if this value ('start') is larger than
                                        // the 'end' value -> change 'end' to 'start' in that case.
                                        // This will also happen if 'end' value is empty.
                                        var end = this.nextSibling('[name=pageEnd]');
                                        if (end.getValue() == null ||
                                            parseInt(start) > parseInt(end.getValue())) 
                                        {
                                            end.setValue(start);
                                        }
                                        
                                        // On change, check if this value ('start') is smaller than
                                        // the 'end' value of the book before this one -> change 'end' 
                                        // to 'start' in that case.
                                        var endOfBookBefore = this.previousNode('[name=pageEnd]');
                                        if (endOfBookBefore != undefined &&
                                            (endOfBookBefore.getValue() == null ||
                                             parseInt(start) <= parseInt(endOfBookBefore.getValue()))) 
                                        {
                                            endOfBookBefore.setValue(start);
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
                                name: 'pageEnd',
                                width: 63,
                                minValue: 1,
                                allowDecimals: false,
                                margins: '0 0 0 10',
                                listeners: {
                                    'change': function (t, end)
                                    {
                                        // On change, check if this value ('end') is lower than
                                        // the 'start' value -> change 'start' to 'end' in that case.
                                        // This will also happen if 'start' value is empty.
                                        var start = this.previousSibling('[name=pageStart]');
                                        if (start.getValue() == null
                                            || parseInt(end) < parseInt(start.getValue())) 
                                        {
                                            start.setValue(end);
                                        }
                                        
                                        // On change, check if this value ('end') is smaller than
                                        // the 'start' value of the book after this one -> change 
                                        // 'start' to 'end' in that case.
                                        var startOfBookAfter = this.nextNode('[name=pageStart]');
                                        if (startOfBookAfter != undefined &&
                                            (startOfBookAfter.getValue() == null ||
                                             parseInt(end) >= parseInt(startOfBookAfter.getValue()))) 
                                        {
                                            startOfBookAfter.setValue(end);
                                        }
                                        
                                        return;
                                    }
                                }
                            }]
                        },{
                            fieldLabel: 'Author',
                            name: 'author',
                            anchor: '98%',
                            allowBlank: true,
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Publisher/printer',
                            name: 'publisher',
                            anchor: '98%',
                            allowBlank: true,
                            labelAlign: 'top'
                        }]
                    },{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            fieldLabel: 'Time period of publication *',
                            anchor: '100%',
                            labelAlign: 'top',
                            items: [{
                                xtype: 'numberfield',
                                name: 'from',
                                width: 63,
                                minLength: 4,
                                maxLength: 4,
                                minValue: 1000,
                                allowDecimals: false,
                                listeners: {
                                    'change': function(f, from)
                                    {
                                        // On change, check if this value ('from') is larger than
                                        // the 'to' value -> change 'to' to 'from' in that case.
                                        // This will also happen if 'to' value is empty.
                                        var to = this.nextSibling('[name=to]');
                                        if (to.getValue() == null ||
                                            parseInt(from) > parseInt(to.getValue())) 
                                        {
                                            to.setValue(from);
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
                                    'change': function(t, to)
                                    {
                                        // On change, check if this value ('to') is lower than
                                        // the 'from' value -> change 'from' to 'to' in that case.
                                        // This will also happen if 'from' value is empty.
                                        var from = this.previousSibling('[name=from]');
                                        if (from.getValue() == null
                                            || parseInt(to) < parseInt(from.getValue())) 
                                        {
                                            from.setValue(to);
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
                            store: store,
                            anchor: '100%',
                            labelAlign: 'top',
                            editable: false,
                            forceSelection: true
                        },{
                            fieldLabel: 'Place published',
                            name: 'placePublished',
                            anchor: '100%',
                            allowBlank: true,
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Version',
                            name: 'version',
                            anchor: '100%',
                            allowBlank: true,
                            labelAlign: 'top'
                        }]
                    }]
                },{
                    xtype: 'button',
                    text: 'Delete book',
                    width: 140,
                    margin: '5 0 10 0',
                    handler: function()
                    {
                        _this.destroy();
                    }
                }]
            };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    getBook: function()
    {
        return {
            title: this.down('[name=title]').getValue(),
            firstPage: this.down('[name=pageStart]').getValue(),
            lastPage: this.down('[name=pageEnd]').getValue(),
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
        
        // TODO: get this from database. (this table is not yet in the model)
        var store = Ext.create('Ext.data.ArrayStore', {
            data: [['nl', 'Dutch'], ['en', 'English'], ['de', 'German']],
            fields: ['value', 'text'],
            sortInfo: {
                field: 'text',
                direction: 'ASC'
            }
        });
        
        var defConfig = {
            items: [{
                xtype: 'bookfieldset'
            },{
                xtype: 'button',
                text: 'Add book',
                width: 140,
                margin: '0 0 10 0',
                handler: function()
                {
                    this.ownerCt.insert(this.ownerCt.items.length - 1, [{xtype: 'bookfieldset'}]);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    getBooks: function()
    {
        var books = [];
        var current = this.down('bookfieldset');
        do {
            books[books.length] = current.getBook();
        } while (current = current.nextSibling('bookfieldset'));
        return books;
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
        
        var defConfig = {
            items: [{
                xtype: 'scanpanel'
            },{
                xtype: 'bindingfieldset'
            },{
                xtype: 'booksfieldset'
            }],
            
            buttons: [{
                xtype: 'button',
                text: 'Reset',
                width: 140,
                handler: function() {
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
                    _this.ownerCt.setLoading('Uploading...');
                    _this.checkIntervalId = setInterval(function(){_this.checkCompleted();},1000);
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
        for (var i = 0; i < scans.length; i++)
        {
            if (scans[i].status != 'success' && scans[i].status != 'error')
            {
                waiting = true;
                break;
            }
        }
        if (!waiting)
        {
            clearInterval(this.checkIntervalId);
            var binding = this.down('bindingfieldset').getBinding();
            var books = this.down('booksfieldset').getBooks();
            var scans = this.down('scanpanel').getValues();
            var result = {binding: binding, books: books, scans: scans};
            this.ownerCt.setLoading("Saving...");
            RequestManager.getInstance().request('BindingUpload', 'upload', result, this, function()
            {
                this.ownerCt.setLoading(false);
                Ext.Msg.alert('Upload', 'Binding added successfully.');
            }, function()
            {
                this.ownerCt.setLoading(false);
                return true;
            });
        }
    },
    
    submit: function()
    {
        this.setLoading("Uploading...", true);
        
        var values = this.getValues();
        
        //alert(this.getValues(false));
    },
    
    reset: function()
    {
        this.callParent();
        
        this.down('scanpanel').reset();
    }
});
