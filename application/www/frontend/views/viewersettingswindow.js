/*
 * Viewer settings form.
 */

Ext.define('Ext.ux.ViewerSettingsForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.viewersettingsform',

    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            items: [/*{
                name: 'somexitingsetting',
                fieldLabel: 'Some exiting setting',
                minLength: 6
            },{
                name: 'anotherxitingsetting',
                fieldLabel: 'Another exiting setting',
                minLength: 8
            }*/
            {
                html: 'There are currently no configurable settings.'
            }],
            
            buttons: [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: 'Save',
                width: 140,
                handler: function()
                {
                    var form = this.up('form').getForm();
                    
                    if (form.isValid())
                    {
                        Ext.Msg.alert('Submitted Values', form.getValues(true));
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

Ext.define('Ext.ux.ViewerSettingsWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Viewer settings',
            layout: 'fit',
            width: 600,
            height: 400,
            items: [{
                xtype: 'viewersettingsform'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
