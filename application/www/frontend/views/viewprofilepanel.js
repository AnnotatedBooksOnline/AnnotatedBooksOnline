/*
 * View profile class.
 */

Ext.define('Ext.ux.ViewProfilePanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.viewprofilepanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.UserModel'
        });
        
        store.on('datachanged',
            function(store)
            {
                if (this.first() != undefined)
                {
                    _this.down('[xtype=propertygrid]').setSource(this.first().raw);
                }
            },
            store
        );
        
        store.filter('userId', Authentication.getInstance().getUserId()); // TODO: Set this to the userId to display.
        store.load();
        
        var defConfig = {
            flex: 1,
            items: [{
                xtype: 'propertygrid',
                propertyNames: {
                    email: 'E-mail',
                    firstName: 'First name',
                    lastName: 'Last name',
                    affiliation: 'Affiliation',
                    occupation: 'Occupation',
                    website: 'Website'
                },
                source: {},
                listeners: {
                    // Prevent editing (as this is a view profile, not edit)
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders : true
            }
            // TODO: add information like last added annotation, forum post, ...
            ]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

