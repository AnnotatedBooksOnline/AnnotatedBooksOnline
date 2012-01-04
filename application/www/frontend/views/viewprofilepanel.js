/*
 * View profile class.
 */

Ext.define('Ext.ux.ViewProfilePanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.viewprofilepanel',
    
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
                    homeAddress: 'Address'//,
                    // rank: 'Rank',
                },
                source: {},
                listeners: {
                    // Prevent editing (as this is a view profile, not edit)
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders: true
            }
            // TODO: add information like last added annotation, forum post, ...
            ]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // TODO
        RequestManager.getInstance().request(
            'Authentication',
            'hasPermissionTo',
            // TODO: change to 'delete-users'. This setting is not yet available.
            {action: 'ban-users'},
            this,
            function(data)
            {
                // Add delete button
                _this.add([{
                    xtype: 'button',
                    text: 'Delete user',
                    id: 'delete',
                    width: '140',
                    handler: function ()
                    {
                        var username = store.collect('username')[0];
                        
                        // Shows a window to doublecheck if this is what the user wanted.
                        // Deletes the user afterwards.
                        Ext.Msg.show({
                            title: 'Are you sure?',
                            msg: 'You are about to delete \'' + username + 
                                 '\', this can\'t be undone. Are you sure?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            callback: function(button)
                                {
                                    if (button == 'yes')
                                    {
                                        // Delete the user.
                                        RequestManager.getInstance().request(
                                            'User',
                                            'deleteUser',
                                            {username: username},
                                            _this
                                        );
                                        
                                        _this.close();
                                    }
                                }
                        });
                    }
                }]);
            }
        );
        
        RequestManager.getInstance().request(
            'Authentication',
            'hasPermissionTo',
            {action: 'ban-users'},
            this,
            function(data)
            {
                // Add ban button
                _this.add([{
                    xtype: 'button',
                    text: 'Ban user',
                    id: 'ban',
                    width: '140',
                    handler: function ()
                    {
                        var username = store.collect('username')[0];
                        
                        // Shows a window to doublecheck if this is what the user wanted.
                        // Bans the user afterwards.
                        Ext.Msg.show({
                            title: 'Are you sure?',
                            msg: 'You are about to ban \'' + username +
                                 '\', this can\'t be undone. Are you sure?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            callback: function(button)
                                {
                                    if (button == 'yes')
                                    {
                                        // Ban the user.
                                        RequestManager.getInstance().request(
                                            'User',
                                            'banUser',
                                            {username: username},
                                            _this
                                        );  
                                    }
                                }
                        });
                    }
                }]);
            }
        );
    }
});

