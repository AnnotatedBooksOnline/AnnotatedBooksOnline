Ext.onReady(function() {
    var accordion = new Ext.Panel({
        region:'center',
        layout:'accordion',
        split: true,
        items:[{
            title:'Upload',
            xtype:'uploadpanel'
        },{
            title:'Userlist',
            xtype:'userlistpanel'
        },{
            title:'Edit profile',
            xtype:'editprofileform'
        },{
            title:'View profile of \'thisisme\'',
            xtype:'viewprofilepanel'
        },{
            title:'Registration',
            xtype:'registrationform'
        },{
            title:'Login',
            xtype:'loginform'
        },{
            title:'Search for books',
            xtype:'panel',
            autoHeight: true,
            items: [{
                xtype: 'searchpanel'
            },{
                xtype: 'searchresults'
            }]
        }]
    });
    
    Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [accordion]
    });
});

