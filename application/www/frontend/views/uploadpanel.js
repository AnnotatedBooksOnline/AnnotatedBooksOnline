/*
 * Upload panel class.
 */

Ext.define('Ext.ux.UploadForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.uploadform',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
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
        
        // TODO: let this function communicate with db, define better name
        // defined @ library & signature
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
                items: [{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    combineErrors: true,
                    defaultType: 'filefield',
                    items: [{
                        id: 'xml-file',
                        emptyText: 'Select an XML-file',
                        fieldLabel: 'XML',
                        name: 'xml-path',
                        buttonText: 'Browse...',
                        allowBlank: true,
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
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    combineErrors: true,
                    defaultType: 'filefield',
                    items: [{
                        id: 'scan-file-1',
                        emptyText: 'Select an scan',
                        fieldLabel: 'Scan *',
                        name: 'scan-file-1',
                        buttonText: 'Browse...',
                        validator: function(value)
                        {
                            var extension = value.substr(value.length-5).toLowerCase();
                            if (extension === ".tiff" 
                             || extension === ".jpeg" 
                             || extension.substr(1) === ".jpg")
                            {
                                return true;
                            }
                            else
                            {
                                return 'File must be JPG, JPEG or TIFF (lower case is accepted).';
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
                        disabled: true,
                        width: 140,
                        margins: '0 0 0 10',
                        handler: function()
                        {
                            // TODO: handler
                        }
                    }]
                },{
                    xtype: 'button',
                    text: 'Add scan',
                    width: 140,
                    handler: function()
                    {
                        // TODO: handler
                    }
                }]
            },{
                xtype: 'fieldset',
                title: 'Binding',
                defaultType: 'textfield',
                items: [{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Library *',
                        name: 'library',
                        validator: function(library)
                        {
                            var signature = this.nextSibling('[name=signature]');
                            return checkLibrarySignature(library, signature.getValue());
                        }
                    },{
                        fieldLabel: 'Signature *',
                        name: 'signature',
                        margins: '0 0 0 10',
                        validator: function(signature)
                        {
                            var library = this.previousSibling('[name=library]');
                            return checkLibrarySignature(library.getValue, signature);
                        }
                    }]
                },{
                    xtype: 'fieldcontainer',
                    layout: 'hbox',
                    defaultType: 'textfield',
                    items: [{
                        fieldLabel: 'Provenance',
                        name: 'provenance',
                        allowBlank: true
                    },{
                        xtype: 'combobox', 
                        fieldLabel: 'Languages of annotations',
                        name: 'languagesofannotations',
                        mode: 'local',
                        store: store,
                        multiSelect: true,
                        allowBlank: true,
                        margins: '0 0 0 10'
                    }]   
                },{
                    xtype: 'textareafield',
                    grow: true,
                    width: 520,
                    fieldLabel: 'Summary',
                    name: 'summary',
                    allowBlank: true
                }]
            },{
                xtype: 'fieldset',
                title: 'Books',
                defaultType: 'textfield',
                layout: 'anchor',
                items: [{
                    xtype: 'fieldset',
                    title: 'Book',
                    defaultType: 'textfield',
                    layout: 'anchor',
                    items: [{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Title *',
                            name: 'title'
                        },{
                            xtype: 'numberfield',
                            fieldLabel: 'Time period *',
                            name: 'from',
                            width: 168,
                            minLength: 4,
                            maxLength: 4,
                            margins: '0 0 0 10',
                            listeners: {
                                'change': function(f, from) {
                                    var to = this.nextSibling('[name=to]');
                                    to.setValue(from);
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
                            margins: '0 0 0 10',
                            validator: function(to)
                            {
                                var from = this.previousSibling('[name=from]');
                                return (parseInt(from.getValue()) > parseInt(to)) 
                                    ? 'A time period can\'t go back in time' 
                                    : true;
                            }
                        }]
                    },{ 
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Starting page *',
                            name: 'startingpage'
                        },{
                            xtype: 'combobox', 
                            fieldLabel: 'Languages *',
                            name: 'languages',
                            mode: 'local',
                            multiSelect: true,
                            store: store,
                            margins: '0 0 0 10'
                        }]
                    },{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Author',
                            name: 'author'
                        },{
                            fieldLabel: 'Place published',
                            name: 'placepublished',
                            margins: '0 0 0 10'
                        }]
                    },{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaultType: 'textfield',
                        items: [{
                            fieldLabel: 'Publisher/printer',
                            name: 'publisher'
                        },{
                            fieldLabel: 'Version',
                            name: 'version',
                            margins: '0 0 0 10'
                        }]
                    },{
                        xtype: 'button',
                        disabled: true,
                        text: 'Delete book',
                        width: 140,
                        handler: function()
                        {
                            // TODO: handler
                        }
                    }]
                },{
                    xtype: 'button',
                    text: 'Add book',
                    width: 140,
                    handler: function()
                    {
                        // TODO: handler
                    }
                }]
            }],
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Save',
                width: 140,
                handler: function()
                {
                    // TODO: submit values
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
