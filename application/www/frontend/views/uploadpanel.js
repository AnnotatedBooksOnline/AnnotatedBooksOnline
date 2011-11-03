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
                        buttonText: 'Browse...'
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
                        buttonText: 'Browse...'
                    },{
                        // TODO: add percentage
                        xtype: 'label',
                        text: 'Some percentage..',
                        margins: '0 0 0 10'
                    }]
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
                        name: 'library'
                    },{
                        fieldLabel: 'Signature *',
                        name: 'signature',
                        margins: '0 0 0 10'
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
                            margins: '0 0 0 10'
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
                            margins: '0 0 0 10'
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
                text: 'Save',
                width: 140,
                handler: function()
                {
                    // TODO: handler
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
