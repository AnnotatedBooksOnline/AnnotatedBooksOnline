/*
 * Userlist panel class.
 */

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.userlistpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        var startup = true;
        
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
                    
                    if (!startup) 
                    {
                        Ext.Msg.show({
                            title: 'Are you sure?',
                            msg: 'Are you sure you want to change the auto user acceptance to \''
                                + changedTo + '\'?',
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
                                           // No need to do anything on success.
                                       },
                                       function()
                                       {
                                           return true;
                                       }
                                   );
                                }
                            }
                        });
                    }
                    else
                    {
                        startup = false;
                    }
                }
            }
        };
        
        var store = Ext.create('Ext.ux.StoreBase', {
            model: 'Ext.ux.UserModel',
            pageSize: 20
        });
        
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
