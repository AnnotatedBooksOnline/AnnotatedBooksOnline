/*
 * Transcription editor form class.
 */

Ext.define('Ext.ux.TranscriptionEditorForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.transcriptioneditorform',
    
    initComponent: function() 
    {
        var _this = this;
        
        // Create a text area for each info category and place them under each other.
        // For _Color, make a nice color picker.
        // TODO? When there are a lot (e.g. more than three) of categories, use a different display method.
        
        var categories = getAnnotationInfoCategories();
        var textAreas = [];
        
        for(var i = 0; i < categories.length; ++i)
        {
            var fieldValue = _this.model.get('annotationInfo')[i];
            if (categories[i] != '_Color')
            {
            	textAreas.push({
                    xtype: 'textarea',
                    fieldLabel: categories[i],
                    labelAlign: 'top',
                    name: 'annotationInfoField' + i,
                    value: fieldValue,
                    style: 'margin-right: 5px;',
                    flex: 1,
                    allowBlank: true
            	});
        	}
        	else
        	{
        	    var colorRadioBoxes = [];
        	    var colors = this.annotations.getAvailableColors();
        	    for (var j = 0; j < colors.length; j++)
        	    {
        	        var color = brighten(colors[j], 0.8);
        	        colorRadioBoxes.push({
                        name: 'annotationInfoField' + i,
                        boxLabel: '<div style="background-color: ' + color
                            + '; display:inline-block; width: 30px; height: 20px; '
                            + (j < colors.length / 2 ? '' : 'margin-top: 10px; ')
                            + 'margin-bottom: -7px; border: 1px solid black"/>',
                        inputValue: j,
                        checked: fieldValue == j
                    });
                }
        	    textAreas.push({
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Color',
                    labelAlign: 'top',
                    value: fieldValue,
                    style: 'margin-right: 5px;',
                    flex: 1,
                    defaultType: 'radiofield',
                    defaults: {
                        flex: 1,
                        style: 'margin-right: 10px;'
                    },
                    layout: {
                        type: 'table',
                        columns: Math.ceil(colors.length / 2)
                    },
                    items: colorRadioBoxes
            	});
        	}
        }
        
        var defConfig = {
            layout:{
                type: 'vbox',
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
        var newAnnotationInfo = new Array(annotationInfo.length);
        var categories = getAnnotationInfoCategories();
        var data = this.getValues();
        var updated = false;
        for(var i = 0; i < categories.length; ++i)
        {
        	newAnnotationInfo[i] = data['annotationInfoField' + i];
        	if (newAnnotationInfo[i] !== annotationInfo[i])
        	{
        	    updated = true;
        	}
        }
        
        if (updated)
        {
            this.model.set('annotationInfo', newAnnotationInfo);
        }
        
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
                model: this.annotation,
                annotations: this.annotations
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
