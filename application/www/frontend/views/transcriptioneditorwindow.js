/*
 * Transcription editor form class.
 */

Ext.define('Ext.ux.TranscriptionEditorForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.transcriptioneditorform',
    
    initComponent: function() 
    {
        var _this = this;
        
        // Create a text area for each info category and place them next to each other.
        // TODO? When there are a lot (e.g. more than three) of categories, use a different display method.
        
        var categories = getAnnotationInfoCategories();
        var textAreas = [];
        
        for(var i = 0; i < categories.length; ++i)
        {
        	textAreas.push({
                xtype: 'textarea',
                fieldLabel: categories[i],
                labelAlign: 'top',
                name: 'annotationInfoField' + i,
                value: _this.model.get('annotationInfo')[i],
                style: 'margin-right: 5px;',
                flex: 1,
                allowBlank: true
        	});
        }
        
        var defConfig = {
            layout:{
                type: 'hbox',
                align: 'stretch'
            },
            items: textAreas,
            buttons: [{
                xtype: 'button',
                text: 'Cancel',
                iconCls: 'cancel-icon',
                width: 140,
                handler: function()
                {
                    _this.up('transcriptioneditorwindow').close();
                }
            },{
                xtype: 'button',
                formBind: true,
                disabled: true,
                iconCls: 'accept-icon',
                text: 'Done',
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
        var annotationInfo = this.model.get('annotationInfo');
        var categories = getAnnotationInfoCategories();
        var data = this.getValues();
        for(var i = 0; i < categories.length; ++i)
        {
        	annotationInfo[i] = data['annotationInfoField' + i];
        }
        
        this.model.set('annotationInfo', annotationInfo);        
        
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
