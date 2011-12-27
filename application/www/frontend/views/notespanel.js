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
                            _this,
                            function()
                            {},
                            function(data)
                            {
                                _this.down('[name=notes]').setValue('failed to save');
                            }
                        );
                    }
                }
            }]
        };

        Ext.apply(this, defConfig);		

        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
        this.eventDispatcher = new EventDispatcher();

        this.callParent();
    },

    afterRender: function()
    {   
        var _this = this;
        var token = null;
        RequestManager.getInstance().request(
            'Note'
            'Load',
            {token: token},
            _this,
            function(data)
            {
                _this.down('[name=notes]').setValue(data);
            },
            function(data)
            {
                _this.down('[name=notes]').setValue('failed to load');
            }
        );
    },

    onAuthenticationChange: function(event, authentication)
    {
        var _this = this;
        //TODO get this working and set visibility when initializing
        if (authentication.isLoggedOn())
        {
            _this.show();
        }
        else
        {
            _this.hide();
        }
    }
});