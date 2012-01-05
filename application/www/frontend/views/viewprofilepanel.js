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
        
        var username = this.tabInfo.data[0];
        
        store.filter('username', username);
        
        
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
                    //homeAddress: 'Address',
                    active: 'Active',
                    banned: 'Banned',
                    rank: 'Rank'
                },
                source: {},
                listeners: {
                    // Prevent editing (as this is a view profile, not edit)
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders: true
            },{
                xtype: 'button',
                text: 'Unban user',
                id: 'unban',
                width: '140',
                handler: function ()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Unbans the user afterwards.
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to unban \'' + username + '\'. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    // Ban the user.
                                    RequestManager.getInstance().request(
                                        'User',
                                        'unBanUser',
                                        {username: username},
                                        _this,
                                        function()
                                        {
                                            store.load();
                                        }
                                    );  
                                }
                            }
                    });
                }
            },{
                xtype: 'button',
                text: 'Ban user',
                id: 'ban',
                width: '140',
                handler: function ()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Bans the user afterwards.
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to ban \'' + username + '\'. Are you sure?',
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
                                        _this,
                                        function()
                                        {
                                            store.load();
                                        }
                                    );  
                                }
                            }
                    });
                }
            },{
                xtype: 'button',
                text: 'Delete user',
                id: 'delete',
                width: '140',
                handler: function ()
                {
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
                                        _this,
                                        function()
                                        {
                                            _this.close();
                                        }
                                    );
                                }
                            }
                    });
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

