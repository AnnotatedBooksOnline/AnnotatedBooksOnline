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
        store.on('load',
        	function(store, records, successfull)
        	{
        		if (!successfull) {
        			return;
        		}
        		
        		// Enable the 'unban' button for banned users and disable the 'unban' 
        		// button. Disable the 'unban' button for unbanned users and enable
        		// the 'ban' button.
                if (store.data.get(0).get('banned') == '0') 
                {
                	_this.down('[id=unban]').setDisabled(true);
                	_this.down('[id=ban]').setDisabled(false);
        		} 
                else 
        		{
                	_this.down('[id=ban]').setDisabled(true);
                	_this.down('[id=unban]').setDisabled(false);
        		}
                
                // Enable the 'accept' and 'decline' buttons when the user is pending
                // activation. Disable them otherwise.
                if (store.data.get(0).get('activationStage') == '0') 
                {
                	_this.down('[id=accept]').setDisabled(false);
                	_this.down('[id=decline]').setDisabled(false);
                }
                else
                {
                	_this.down('[id=accept]').setDisabled(true);
                	_this.down('[id=decline]').setDisabled(true);                	
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
                //enabled: store.data[0].get('banned') == '1',
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
                //enabled: store.data[0].get('banned') == '0',
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
            },{
                xtype: 'button',
                text: 'Change Role',
                id: 'changerole',
                width: '140',
                handler: function ()
                {
                }
            },{
                xtype: 'button',
                text: 'Accept',
                id: 'accept',
                width: '140',
                handler: function ()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Accepts the user afterwards.
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to accept \'' + username + '\'. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    // Accept the user.
                                    RequestManager.getInstance().request(
                                        'UserActivation',
                                        'setUserAccepted',
                                        {username: username,
                                         accepted: true},
                                        null,
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
                text: 'Decline',
                id: 'decline',
                width: '140',
                handler: function ()
                {
                    // Shows a window to doublecheck if this is what the user wanted.
                    // Declines the user afterwards.
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'You are about to decline \'' + username + '\'. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    // Decline the user.
                                    RequestManager.getInstance().request(
                                        'UserActivation',
                                        'setUserAccepted',
                                        {username: username,
                                         accepted: false},
                                        null,
                                        function()
                                        {
                                            store.load();
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

/*
 * Password restoration window.
 */
Ext.define('Ext.ux.ChangePasswordWindow', {
    extend: 'Ext.ux.WindowBase',

    initComponent: function() 
    {
        var defConfig = {
            title: 'Change password',
            layout: 'fit',
            width: 400,
            height: 150,
            items: [{
                xtype: 'restorepasswordform',
                border: false,
                width: 400,
                height: 150
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
