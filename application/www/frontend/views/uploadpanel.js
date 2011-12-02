/*
 * Scan fieldcontainer class
 */
Ext.define('Ext.ux.ScanFieldcontainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.scanfieldcontainer',
    initComponent: function() {
        var _this = this;
        
        var defConfig = {
            layout: 'hbox',
            combineErrors: true,
            defaultType: 'filefield',
            items: [{
                emptyText: 'Select an scan',
                fieldLabel: 'Scan *',
                name: 'scan',
                buttonText: 'Browse...',
                validator: function(value)
                {
                    var extension = value.substr(value.length-5).toLowerCase();
                    if (extension === ".tiff" 
                     || extension === ".jpeg" 
                     || extension.substr(1) === ".jpg"
                     || extension.substr(1) === ".tif")
                    {
                        return true;
                    }
                    else
                    {
                        return 'File must be JPG, JPEG, TIF or TIFF (lower case is accepted).';
                    }
                }
            },{
                // TODO: add percentage
                xtype: 'label',
                text: 'Some percentage..',
                margins: '0 0 0 10'
            },{
                xtype: 'button',
                text: 'Delete scan',
                //disabled: true,
                width: 140,
                margins: '0 0 0 10',
                handler: function()
                {
                    _this.destroy();
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Book fieldset class
 */
Ext.define('Ext.ux.BookFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bookfieldset',
    title: 'Book: ?',
    collapsible: true,
    initComponent: function() {
        var _this = this;
    
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
                            fieldLabel: 'Title *',
                            name: 'title',
                            anchor: '98%',
                            labelAlign: 'top',
                            listeners: {
                                'change': function(t, title) {
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
                        }]
                    },{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            fieldLabel: 'Time period *',
                            anchor: '100%',
                            labelAlign: 'top',
                            items: [{
                                xtype: 'numberfield',
                                name: 'from',
                                width: 63,
                                minLength: 4,
                                maxLength: 4,
                                allowNegative: false,
                                allowDecimals: false,
                                listeners: {
                                    'change': function(f, from) {
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
                                allowNegative: false,
                                allowDecimals: false,
                                margins: '0 0 0 10',
                                listeners: {
                                    'change': function(t, to) {
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
                        }]
                    }]
                },{
                xtype: 'container',
                anchor: '100%',
                layout: 'column',
                    items: [{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Starting page *',
                            name: 'startingpage',
                            anchor: '98%',
                            margins: '0 0 10 0',
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Author',
                            name: 'author',
                            anchor: '98%',
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Publisher/printer',
                            name: 'publisher',
                            anchor: '98%',
                            labelAlign: 'top'
                        }]
                    },{
                        xtype: 'container',
                        columnWidth: .5,
                        layout: 'anchor',
                        defaultType: 'textfield',
                        items: [{
                            xtype: 'combobox', 
                            fieldLabel: 'Languages *',
                            name: 'languages',
                            mode: 'local',
                            multiSelect: true,
                            store: store,
                            anchor: '100%',
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Place published',
                            name: 'placepublished',
                            anchor: '100%',
                            labelAlign: 'top'
                        },{
                            fieldLabel: 'Version',
                            name: 'version',
                            anchor: '100%',
                            labelAlign: 'top'
                        }]
                    }]
                },{
                    xtype: 'button',
                    //disabled: true,
                    text: 'Delete book',
                    width: 140,
                    handler: function()
                    {
                        _this.destroy();
                    }
                }]
            };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});


/*
 * Upload panel class.
 */
Ext.define('Ext.ux.UploadForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.uploadform',
    
    initComponent: function() 
    {
        var _this = this;
        
        var librarySignatureCheck = true;
        
        // TODO: get this from database (this table is not yet in the model)
        var store = Ext.create('Ext.data.ArrayStore', {
            data: [['nl', 'Dutch'],['en', 'English'],['de', 'German']],
            fields: ['value', 'text'],
            sortInfo: {
                field: 'text',
                direction: 'ASC'
            }
        });
        
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
        
        var defConfig = {
            // TODO : width/dimensions
            items: [{
                xtype: 'fieldset',
                title: 'Upload',
                defaultType: 'filefield',
                layout: 'anchor',
                collapsible: true,
                items: [{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    combineErrors: true,
                    defaultType: 'filefield',
                    items: [{
                        emptyText: 'Select an XML-file',
                        fieldLabel: 'XML *',
                        name: 'xml-path',
                        buttonText: 'Browse...',
                        validator: function(value)
                        {
                            return (value.substr(value.length-4).toLowerCase() === ".xml")
                                ? true 
                                : 'File must be XML.';
                        }
                    },{
                        // TODO: add percentage
                        xtype: 'label',
                        text: 'Some percentage..',
                        margins: '0 0 0 10'
                    }]
                },{
                    xtype: 'scanfieldcontainer'
                },{
                    xtype: 'button',
                    text: 'Add scan',
                    width: 140,
                    handler: function()
                    {
                        this.ownerCt.insert(1, [{xtype: 'scanfieldcontainer'}]);
                    }
                }]
            },{
                xtype: 'fieldset',
                title: 'Binding',
                collapsible: true,
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
                                if (librarySignatureCheck) 
                                {
                                    librarySignatureCheck = false;
                                    signature.validate();
                                    librarySignatureCheck = true;
                                }
                                return checkLibrarySignature(library, signature.getValue());
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
                                if (librarySignatureCheck) 
                                {
                                    librarySignatureCheck = false;
                                    library.validate();
                                    librarySignatureCheck = true;
                                }
                                return checkLibrarySignature(library.getValue(), signature);
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
                            allowBlank: true
                        }]   
                    }]
                },{
                    xtype: 'textareafield',
                    fieldLabel: 'Summary',
                    name: 'summary',
                    anchor: '100%',
                    labelAlign: 'top',
                    allowBlank: true
                }]
            },{
                xtype: 'fieldset',
                title: 'Books',
                name: 'books',
                collapsible: true,
                items: [{
                    xtype: 'bookfieldset'
                },{
                    xtype: 'button',
                    text: 'Add book',
                    width: 140,
                    handler: function()
                    {
                        this.ownerCt.insert(0, [{xtype: 'bookfieldset'}]);
                    }
                }]
            }]
            ,
            
            submitButtonText: 'Save'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
