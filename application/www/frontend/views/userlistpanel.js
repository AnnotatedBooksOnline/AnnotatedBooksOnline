/*
 * Userlist panel class.
 */

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.userlistpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var thisChange = true;
        
        var store = Ext.create('Ext.ux.StoreBase', {
            model: 'Ext.ux.UserModel',
            pageSize: 20,
                        remoteFilter: false
        });
                     
        store.filter([{
            filterFn: function(record)
            {
                return record.get('username') != '<deleted user>';
            }
        }]);
                    
        
        // The checkbox to toggle automatic user activation.
        var autoAcceptBox = {
            xtype: 'checkbox',
            boxLabel: 'Automatically accept user registration requests',
            id: 'autoAcceptBox',
            listeners: {
                change: function ()
                {
                    var value = Ext.getCmp('autoAcceptBox').getValue();
                    var changedTo = 'off';
                    
                    if (value) 
                    {
                        changedTo = 'on';
                    }
                    
                    if (thisChange)
                    {
                        thisChange = false;
                    }
                    else
                    {
                        thisChange = true;
                        Ext.Msg.show({
                            title: 'Are you sure?',
                            msg: 'Are you sure you want to turn automatic user acceptance '
                                + changedTo + '?',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    RequestManager.getInstance().request(
                                       'UserActivation',
                                       'setAutoAcceptance',
                                       {autoAccept: value},
                                       _this,
                                       function()
                                       {
                                           store.load();
                                       },
                                       function()
                                       {
                                           return true;
                                       }
                                   );
                                   thisChange = false;
                                }
                                else
                                {
                                    Ext.getCmp('autoAcceptBox').setValue(!value);
                                }
                            }
                        });
                    }
                }
            }
        };
        
        store.loadPage(1);
        
        function renderEmail(email)
        {
            var escapedEmail = escape(email);
            return '<a href="mailto:' + escapedEmail + '">' + escapedEmail + '</a>';
        }
        
        function renderWebsite(website)
        {
            var escapedWebsite = escape(website);
            if (website == null)
            {
                return '';
            }
            else if (website.match(/^(http|ftp)s?:\/\//))
            {
                return '<a href="' + escapedWebsite + '" target="_blank">' + escapedWebsite + '</a>';
            } 
            else
            {
                return '<a href="http://' + escapedWebsite + '" target="_blank">' + escapedWebsite + '</a>';
            }
        }
        
        function renderBanned(banned) 
        {
            if (banned === true) 
            {
                return 'Yes';
            } 
            else 
            {
                return 'No';
            }
        }
        
        function renderActivationStage(activationStage)
        {
            if (activationStage == '0') 
            {
                return 'Pending';
            } 
            else if (activationStage == '1') 
            {
                return 'Accepted';
            } 
            else if (activationStage == '2') 
            {
                return 'Declined';
            } 
            else if (activationStage == '3') 
            {
                return 'Active';
            }
        }
        
        function renderRank(rank)
        {
            if (rank == '10') 
            {
                return 'Normal user';
            } 
            else if (rank == '40') 
            {
                return 'Moderator';
            } 
            else if (rank == '50') 
            {
                return 'Administrator';
            }
        }
        
        function renderDate(unixtime) 
        {
        	var date = new Date(unixtime * 1000);
        	return date.toDateString();
        }
        
        function renderTimestamp(unixtime)
        {
        	var date = new Date(unixtime * 1000);
        	var h = date.getHours();
        	var m = date.getMinutes();
        	// TODO : lol
        	return date.toDateString() + " " + ((h < 10) ? "0" : "") + h + ":" + ((m < 10) ? "0" : "") + m;
        }
        
        var defConfig = {
            border: false,
            items: [{ 
                xtype: 'grid',
                name: 'grid',
                border: false,
                store: store,
                columns: [{
                    text:      'Username',
                    flex:      2,
                    dataIndex: 'username'
                },{
                    text:      'E-mail',
                    flex:      1,
                    renderer:  renderEmail,
                    dataIndex: 'email'
                },{
                    text:      'First name',
                    flex:      1,
                    dataIndex: 'firstName'
                },{
                    text:      'Last name',
                    flex:      2,
                    dataIndex: 'lastName'
                },{
                    text:      'Affiliation',
                    flex:      1,
                    dataIndex: 'affiliation',
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Occupation',
                    flex:      1,
                    dataIndex: 'occupation',
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Website',
                    flex:      2,
                    renderer:  renderWebsite,
                    dataIndex: 'website',
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Address',
                    flex:      2,
                    dataIndex: 'homeAddress',
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Role',
                    flex:      2,
                    dataIndex: 'rank',
                    renderer:  renderRank,
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Banned',
                    flex:      2,
                    dataIndex: 'banned',
                    renderer:  renderBanned,
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Status',
                    flex:      2,
                    dataIndex: 'activationStage',
                    renderer:  renderActivationStage,
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Registration date',
                    flex:      2,
                    dataIndex: 'registrationDate',
                    renderer:  renderDate,
                    hidden:    true,
                    hideable:  false
                },{
                    text:      'Last active',
                    flex:      2,
                    dataIndex: 'lastActive',
                    renderer:  renderTimestamp,
                    hidden:    true,
                    hideable:  false
                }],
                tbar: {
                    xtype: 'pagingtoolbar',
                    store: store,
                    displayInfo: true,
                    displayMsg: 'Displaying users {0} - {1} of {2}',
                    emptyMsg: 'No users to display'
                },
                listeners: {
                    itemclick: function(view, model)
                    {
                        // Open user in a new tab if not clicked on 'email' or 'website'.
                        if ((model.get('dataIndex') !== 'email') && (model.get('dataIndex') !== 'website'))
                        {
                            var name = model.get('username');
        
                            RequestManager.getInstance().request(
                                'Authentication',
                                'hasPermissionTo',
                                {action: 'view-users-complete'},
                                this,
                                function(hasPermission)
                                {
                                    if (hasPermission)
                                    {
                                        Application.getInstance().gotoTab('viewprofile', [name], true);
                                    }
                                }
                            );
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        if(Authentication.getInstance().hasPermissionTo('change-global-settings'))
        {
            // Add autoAcceptBox with current value.
            RequestManager.getInstance().request(
                    'Setting',
                    'getSetting',
                    {setting: 'auto-user-acceptance'},
                    _this,
                    function(value)
                    {
                        _this.insert(0, autoAcceptBox);
                       Ext.getCmp('autoAcceptBox').setValue(value == '1');
                    },
                    function(error)
                    {
                        if(error == 'access-denied')
                        {
                            return false;
                        }
                            
                        return true;
                    }
                );        
        }
        
        RequestManager.getInstance().request(
            'Authentication',
            'hasPermissionTo',
            {action: 'view-users-complete'},
            this,
            function(hasPermission)
            {
                if (hasPermission)
                {
                    _this.showFields();
                }
            }
        );
    },
    
    showFields: function(hidden)
    {
        var columns = this.down('[name=grid]').columns;
        
        for (var i=0; i < columns.length; i++)
        {
            var column = columns[i];
            column.hideable = true; // doesn't work?
            column.show();
        }
    }
});
