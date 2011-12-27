/*
 * Note panel class.
 */

Ext.define('Ext.ux.Notespanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.notespanel',
    
    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            border: false,
            layout: 'fit',
            flex: 0,
            height: 600,
            items: [{
                xtype: 'textarea',
                name: 'notes',
                grow: false,
                allowBlank: true,
                listeners: {
                    change: function(comp, newValue, oldValue, obj)
                    {
                        var token = newValue;
                        RequestManager.getInstance().request(
                            'Note',
                            'Save',
                            {token: token},
                            this,
                            function()
                            {},
                            function(data)
                            {
                                this.setValue('failed to save');
                            }
                        );
                    }
                }
            }]
        };

        Ext.apply(this, defConfig);
        this.callParent();
        
        this.notes = this.getComponent(0);
    },

    afterRender: function()
    {   
        var token = null;
        RequestManager.getInstance().request(
            'Note',
            'Load',
            {token: token},
            this,
            function(data)
            {
                this.notes.setValue(data);
            },
            function(data)
            {
               this.notes.setValue('failed to load');
            }
        );
    }
});

