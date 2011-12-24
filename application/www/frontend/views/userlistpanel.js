/*
 * Userlist panel class.
 */

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.form.Panel',
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
            return '<a href="mailto:' + email + '" target="_blank">' + email + '</a>';
        }
        
        function renderWebsite(website)
        {
            if (website.substr(0, 4) === 'http') 
            {
                return '<a href="' + website + '" target="_blank">' + website + '</a>';
            } 
            else
            {
                return '<a href="http://' + website + '" target="_blank">' + website + '</a>';
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
                columns: [{
                    text:      'Username',
                    flex:      1,
                    sortable:  true,
                    dataIndex: 'username'
                },{
                    text:      'E-mail',
                    width:     200,
                    sortable:  true,
                    renderer:  renderEmail,
                    dataIndex: 'email'
                },{
                    text:      'First name',
                    width:     150,
                    sortable:  true,
                    dataIndex: 'firstName'
                },{
                    text:      'Last name',
                    width:     150,
                    sortable:  true,
                    dataIndex: 'lastName'
                },{
                    text:      'Affiliation',
                    width:     150,
                    sortable:  true,
                    dataIndex: 'affiliation'
                },{
                    text:      'Occupation',
                    width:     150,
                    sortable:  true,
                    dataIndex: 'occupation'
                },{
                    text:      'Website',
                    width:     150,
                    sortable:  true,
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
                    itemclick: function(view, record)
                    {
                        // Open user in a new tab if not clicked on 'email' or 'website'.
                        if (view.get('dataIndex')!='email' && view.get('dataIndex')!='website')
                        {
                            var name = record.get('username');
                            Application.getInstance().gotoTab('viewprofile', [name], true);
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});
