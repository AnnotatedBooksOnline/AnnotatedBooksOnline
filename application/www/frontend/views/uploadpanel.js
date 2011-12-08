/*
 * Scan fieldcontainer class.
 */
Ext.define('Ext.ux.ScanFieldcontainer', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.scanfieldcontainer',
    initComponent: function() {
        var _this = this;
        
        var defConfig = {
            layout: 'hbox',
            combineErrors: true,
            defaultType: 'label',
            items: [{
                text: 'This is a scan'
            },{
                // TODO: add percentage
                text: 'Some percentage..',
                margins: '0 0 0 10'
            },{
                xtype: 'button',
                text: 'Delete scan',
                disabled: false,
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
 * Upload fieldset class.
 */
Ext.define('Ext.ux.UploadFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.uploadfieldset',
    title: 'Upload',
    collapsible: true,
    initComponent: function() {
        var _this = this;
        
        var defConfig = {
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
                xtype: 'label',
                text: 'Scans *:'
            },{
                xtype: 'filefield',
                buttonOnly: true,
                fieldLabel: 'Add scan',
                buttonText: 'Browse...',
                listeners: {
                    'change': function (fb, value)
                    {
                        var extension = value.substr(value.length-5).toLowerCase();
                        if (extension === ".tiff" 
                         || extension === ".jpeg" 
                         || extension.substr(1) === ".jpg"
                         || extension.substr(1) === ".tif")
                        {
                            this.ownerCt.insert(this.ownerCt.items.length-1, 
                                                [{xtype: 'scanfieldcontainer'}]);
                            Ext.Msg.alert('File uploaded!', value);
                        }
                        else
                        {
                            Ext.Msg.alert('Wrong extension!', 'File must be JPG, JPEG, TIF or TIFF (lower case is accepted).');
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Binding fieldset class.
 */
Ext.define('Ext.ux.BindingFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bindingfieldset',
    title: 'Binding',
    collapsible: true,
    initComponent: function() {
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
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
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
    
        // TODO: get this from database
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
                            xtype: 'container',
                            columnWidth: .5,
                            layout: 'anchor',
                            defaultType: 'textfield',
                            items: [{
                                xtype: 'fieldcontainer',
                                layout: 'hbox',
                                fieldLabel: 'Pages *',
                                anchor: '100%',
                                labelAlign: 'top',
                                items: [{
                                    xtype: 'numberfield',
                                    name: 'start',
                                    width: 63,
                                    allowNegative: false,
                                    allowDecimals: false,
                                    listeners: {
                                        'change': function (f, start) {
                                            // On change, check if this value ('start') is larger than
                                            // the 'end' value -> change 'end' to 'start' in that case.
                                            // This will also happen if 'end' value is empty.
                                            var end = this.nextSibling('[name=end]');
                                            if (end.getValue() == null ||
                                                parseInt(start) > parseInt(end.getValue())) 
                                            {
                                                end.setValue(start);
                                            }
                                            
                                            // On change, check if this value ('start') is smaller than
                                            // the 'end' value of the book before this one -> change 'end' 
                                            // to 'start' in that case.
                                            var endOfBookBefore = this.previousNode('[name=end]');
                                            if (endOfBookBefore != undefined &&
                                                (endOfBookBefore.getValue() == null ||
                                                 parseInt(start) < parseInt(endOfBookBefore.getValue()))) 
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
                                    name: 'end',
                                    width: 63,
                                    allowNegative: false,
                                    allowDecimals: false,
                                    margins: '0 0 0 10',
                                    listeners: {
                                        'change': function (t, end) {
                                            // On change, check if this value ('end') is lower than
                                            // the 'start' value -> change 'start' to 'end' in that case.
                                            // This will also happen if 'start' value is empty.
                                            var start = this.previousSibling('[name=start]');
                                            if (start.getValue() == null
                                                || parseInt(end) < parseInt(start.getValue())) 
                                            {
                                                start.setValue(end);
                                            }
                                            
                                            // On change, check if this value ('end') is smaller than
                                            // the 'start' value of the book after this one -> change 
                                            // 'start' to 'end' in that case.
                                            var startOfBookAfter = this.nextNode('[name=start]');
                                            if (startOfBookAfter != undefined &&
                                                (startOfBookAfter.getValue() == null ||
                                                 parseInt(end) > parseInt(startOfBookAfter.getValue()))) 
                                            {
                                                startOfBookAfter.setValue(end);
                                            }
                                            
                                            return;
                                        }
                                    }
                                }]
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
                    //disabled: true,
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
                xtype: 'bookfieldset'
            },{
                xtype: 'button',
                text: 'Add book',
                width: 140,
                margin: '0 0 10 0',
                handler: function()
                {
                    this.ownerCt.insert(this.ownerCt.items.length-1, [{xtype: 'bookfieldset'}]);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
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
                xtype: 'uploadfieldset'
            },{
                xtype: 'bindingfieldset'
            },{
                xtype: 'booksfieldset'
            },{
                xtype: 'button',
                text: 'Reset',
                handler: function() {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to reset the complete form. Data will be lost and ' +
                             'can\'t be undone. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    // Reset the form
                                    _this.getForm().reset(); 
                                }
                            }
                    });
                }
            }]
            ,
            
            submitButtonText: 'Save'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    submit: function()
    {
        this.setLoading("Uploading...", true);
    }
});
