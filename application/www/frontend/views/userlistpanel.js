/*
 * Userlist panel class.
 */

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.userlistpanel',
    
    initComponent: function() 
    {
        var _this = this;
        
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
