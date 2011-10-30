/*
 * Userlist class.
 */

/* option 2
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
*/

Ext.define('Ext.ux.UserListPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.userlistpanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;

        // sample static data for the store
        var myData = [
            ['a','me@email.com','sdf','sdf','sdf','sdf','http://www.test.nl/'],
            ['b','us@them.com','df','df','df','df','https://www.test2.nl'],
            ['c','us@them.com','ds','ds','ds','ds','www.test3.nl/'],
            ['d','us@them.com','sdf','sdf','sdf','sdf','http://test4.nl'],
            ['e','us@them.com','vcbx','vcbx','vcbx','vcbx','https://test5.nl'],
            ['f','us@them.com','fs','fs','fs','fs','http://www.uu.nl/'],
            ['g','us@them.com','sdf','sdf','sdf','sdf','http://www.uu.nl/'],
            ['h','us@them.com','ds','ds','ds','ds','http://www.uu.nl/'],
            ['i','us@them.com','xcvbc','xcvbc','xcvbc','xcvbc','http://www.uu.nl/'],
            ['j','us@them.com','xvb','xvb','xvb','xvb','http://www.uu.nl/'],
            ['k','us@them.com','cxvb','cxvb','cxvb','cxvb','http://www.uu.nl/'],
            ['l','us@them.com','cvb','cvb','cvb','cvb','http://www.uu.nl/'],
            ['m','us@them.com','cxvb','cxvb','cxvb','cxvb','http://www.uu.nl/'],
            ['n','us@them.com','vcbx','vcbx','vcbx','vcbx','http://www.uu.nl/'],
            ['o','us@them.com','c','c','c','c','http://www.uu.nl/'],
            ['p','us@them.com','vcvc','vcvc','vcvc','vcvc','http://www.uu.nl/'],
            ['q','us@them.com','cvx','cvx','cvx','cvx','http://www.uu.nl/'],
            ['r','us@them.com','cv','cv','cv','cv','http://www.uu.nl/'],
            ['s','us@them.com','xcvbc','xcvbc','xcvbc','xcvbc','http://www.uu.nl/'],
            ['t','us@them.com','bv','bv','bv','bv','http://www.uu.nl/'],
            ['u','us@them.com','g','g','g','g','http://www.uu.nl/'],
            ['v','us@them.com','er','er','er','er','http://www.uu.nl/'],
            ['w','us@them.com','ts','ts','ts','ts','http://www.uu.nl/'],
            ['x','us@them.com','dsfg','dsfg','dsfg','dsfg','http://www.uu.nl/'],
            ['Langerdanditkannietoftochwelll','emailadressenkunnenheellangzijn@maarzijndatnooit.com','Langerdanditkannietoftochwelllneetochnietbijnaaaa','Langerdanditkannietoftochwelllneetochnietbijnaaaa','Langerdanditkannietoftochwelllneetochnietbijnaaaa','Langerdanditkannietoftochwelllneetochnietbijnaaaa','http://www.uu.nl/']
        ];
        
        var store = Ext.create('Ext.data.ArrayStore', {
            pageSize: 10,
            fields: [
               {name: 'username'},
               {name: 'email'},
               {name: 'firstname'},
               {name: 'lastname'},
               {name: 'affiliation'},
               {name: 'occupation'},
               {name: 'website'}
            ],
            data: myData
        });
        
        /* option 2
        var store = Ext.create('Ext.data.Store', {
            model: 'User',
            remoteSort: true,
            pageSize: 10,
            proxy: {
                type: 'pagingmemory',
                data: myData,
                reader: {
                    type: 'array'
                }
            }
        });
        */
        
        store.loadPage(1);
        // option 2
        // store.load();
        
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
                store: store,
                layout: 'fit',
                viewConfig: {
                    stripeRows: true
                },
                columns: [
                    {
                        text     : 'Username',
                        flex     : 1,
                        sortable : true,
                        dataIndex: 'username'
                    },
                    {
                        text     : 'E-mail',
                        width    : 200,
                        sortable : true,
                        renderer : email,
                        dataIndex: 'email'
                    },
                    {
                        text     : 'First name',
                        width    : 150,
                        sortable : true,
                        dataIndex: 'firstname'
                    },
                    {
                        text     : 'Last name',
                        width    : 150,
                        sortable : true,
                        dataIndex: 'lastname'
                    },
                    {
                        text     : 'Affiliation',
                        width    : 150,
                        sortable : true,
                        dataIndex: 'affiliation'
                    },
                    {
                        text     : 'Occupation',
                        width    : 150,
                        sortable : true,
                        dataIndex: 'occupation'
                    },
                    {
                        text     : 'Website',
                        width    : 150,
                        sortable : true,
                        renderer : website,
                        dataIndex: 'website'
                    }
                ],
                bbar: Ext.create('Ext.PagingToolbar', {
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