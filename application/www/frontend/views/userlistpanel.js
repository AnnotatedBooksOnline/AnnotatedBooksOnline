/*
 * Userlist class.
 */

Ext.define('User', {
    extend: 'Ext.data.Model',
    requires: ['*'], // TODO: specify
    idProperty: 'user',
    fields: [
       {name: 'username'},
       {name: 'email'},
       {name: 'firstname'},
       {name: 'lastname'},
       {name: 'affiliation'},
       {name: 'occupation'},
       {name: 'website'}
    ]
});

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.userlistpanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        
        var store = Ext.create('Ext.data.Store', {
            pageSize: 10,
            proxy: {
                model: 'User',
                type: 'requestmanager',
                action: 'userList',
                controller: 'User'
            }
        });
        
        store.loadPage(1);
        
        function email(email)
        {
            return '<a href="mailto:' + email + '">' + email + '</a>';
        }
        
        function website(website)
        {
            if (website.substr(0,4) === 'http') 
            {
                return '<a href="' + website + '">' + website + '</a>';
            } 
            else
            {
                return '<a href="http://' + website + '">' + website + '</a>';
            }
        }
        
        
        var defConfig = {
            items: [{
                xtype: 'grid',
                border: false,
                store: store,
                viewConfig: {
                    stripeRows: true
                },
                columns: [
                    {
                        text:      'Username',
                        flex:      1,
                        sortable:  true,
                        dataIndex: 'username'
                    },
                    {
                        text:      'E-mail',
                        width:     200,
                        sortable:  true,
                        renderer:  email,
                        dataIndex: 'email'
                    },
                    {
                        text:      'First name',
                        width:     150,
                        sortable:  true,
                        dataIndex: 'firstname'
                    },
                    {
                        text:      'Last name',
                        width:     150,
                        sortable:  true,
                        dataIndex: 'lastname'
                    },
                    {
                        text:      'Affiliation',
                        width:     150,
                        sortable:  true,
                        dataIndex: 'affiliation'
                    },
                    {
                        text:      'Occupation',
                        width:     150,
                        sortable:  true,
                        dataIndex: 'occupation'
                    },
                    {
                        text:      'Website',
                        width:     150,
                        sortable:  true,
                        renderer:  website,
                        dataIndex: 'website'
                    }
                ],
                tbar: Ext.create('Ext.PagingToolbar', {
                    store: store,
                    displayInfo: true,
                    displayMsg: 'Displaying users {0} - {1} of {2}',
                    emptyMsg: "No users to display"
                }),
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
