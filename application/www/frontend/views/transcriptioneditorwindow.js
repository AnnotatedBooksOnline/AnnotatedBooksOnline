/*
 * Transcription editor form class.
 */

Ext.define('Ext.ux.TranscriptionEditorForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.transcriptioneditorform',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            layout:{
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'textarea',
                fieldLabel: 'Original language',
                labelAlign: 'top',
                name: 'transcriptionEng',
                style: 'margin-right: 5px;',
                flex: 1,
                allowBlank: true
            },{
                xtype: 'textarea',
                fieldLabel: 'English',
                labelAlign: 'top',
                name: 'transcriptionOrig',
                style: 'margin-left: 5px;',
                flex: 1,
                allowBlank: true
            }],
            buttons: [{
                xtype: 'button',
                text: 'Cancel',
                width: 140,
                handler: function()
                {
                    _this.up('transcriptioneditorwindow').close();
                }
            },{
                xtype: 'button',
                formBind: true,
                disabled: true,
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
    
    submit: function()
    {
        this.updateModel();
        
        this.up('transcriptioneditorwindow').close();
    }
});

/*
 * Transcription editor window class.
 */

Ext.define('Ext.ux.TranscriptionEditorWindow', {
    extend: 'Ext.ux.WindowBase',
    alias: 'widget.transcriptioneditorwindow',
    
    initComponent: function() 
    {
        var defConfig = {
            title: 'Transcription editor',
            layout: 'fit',
            width: 600,
            height: 400,
            items: [{
                xtype: 'transcriptioneditorform',
                model: this.annotation
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
