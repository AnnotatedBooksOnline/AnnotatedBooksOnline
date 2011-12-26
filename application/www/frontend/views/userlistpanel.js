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
            model: 'Ext.ux.UserModel'
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
            if (website.match(/^(http|ftp)s?:\/\//))
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
                    dataIndex: 'affiliation'
                },{
                    text:      'Occupation',
                    flex:      1,
                    dataIndex: 'occupation'
                },{
                    text:      'Website',
                    flex:      2,
                    renderer:  renderWebsite,
                    dataIndex: 'website'
                }],
                tbar: {
                    xtype: 'pagingtoolbar',
                    store: store,
                    displayInfo: true,
                    displayMsg: 'Displaying users {0} - {1} of {2}',
                    emptyMsg: 'No users to display'
                },
                listeners: {
                    itemdblclick: function(view, record)
                    {
                        // Open user in a new tab if not clicked on 'email' or 'website'.
                        if ((view.get('dataIndex') !== 'email') && (view.get('dataIndex') !== 'website'))
                        {
                            var name = record.get('username');
                            Application.getInstance().gotoTab('viewprofile', [name], true);
                        }
                    }
                    
                    // TODO: Make enter key also go to record.
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
