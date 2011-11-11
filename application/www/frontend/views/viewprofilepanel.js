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
        
        store.filter('username', this.tabInfo.data[0]);
        
        store.on('datachanged',
            function(store)
            {
                if (this.first() != undefined)
                {
                    var data = this.first().raw;
                    var properties = _this.down('[xtype=propertygrid]').propertyNames;
                    for (property in data)
                    {
                        if (properties[property] == undefined)
                        {
                            delete data[property];
                        }
                    }
                    _this.down('[xtype=propertygrid]').getStore().sort([{
                        sortFn: function()
                        {
                            return 0;
                        }
                    }]);
                    _this.down('[xtype=propertygrid]').setSource(data);
                }
            },
            store
        );
        
        store.load();
        
        var defConfig = {
            flex: 1,
            items: [{
                xtype: 'propertygrid',
                propertyNames: {
                    // userId: 'Identifier',
                    username: 'Username',
                    email: 'Email',
                    firstName: 'First name',
                    lastName: 'Last name',
                    affiliation: 'Affiliation',
                    occupation: 'Occupation',
                    website: 'Website',
                    homeAddress: 'Address',
                    // rank: 'Rank',
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

