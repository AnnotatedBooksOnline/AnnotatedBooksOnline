/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Activation', {
    extend: 'Ext.Panel',
    alias: 'widget.activationpanel',
    
    initComponent: function() 
    {    	
    	// Send request with activation token from URL.
    	var token = this.tabInfo.data[0];
    	var info = 'bla';
    	RequestManager.getInstance().request(
            'UserActivation',
            'activateUser',
            {token: token},
            this,
            function(success)
            {
                if (success)
                {
                    info = 'Yay!';
                }
                else
                {
                    info = 'Nay!';
                }
            },
            function(data)
            {
            	info = 'Meh';
            }
        );
    	
    	var text = {
            
            xtype: 'container',
            items: {
                style: 'text-align: justify;',
                xtype: 'panel',
                border: false,
                width: 500,
                flex: 0,
                html: info
            }
        };
        
       
        var defConfig = {
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                width: 500,
                style: 'margin-bottom: 20px;',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                defaults: {
                    style: 'margin-right: 5px;'
                },
                items: [
                    //loginButton, registerButton, logoutButton, searchButton,
                    //uploadButton, infoButton, moderateButton
                ]
            }, text]
        };
        
        Ext.apply(this, defConfig);
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
        
        //eventDispatcher.bind('modelchange', this, this.onAuthenticationModelChange);
        
        this.callParent();
    },
    
    onAuthenticationChange: function(event, authentication)
    {
//        if (authentication.isLoggedOn())
//        {
//            //this.down('[name=users]').show();
//            //this.down('[name=upload]').show();
//            this.down('[name=logout]').show();
//            this.down('[name=login]').hide();
//            this.down('[name=register]').hide();
//        }
//        else
//        {
//            //this.down('[name=users]').hide();
//            //this.down('[name=upload]').hide();
//            this.down('[name=logout]').hide();
//            this.down('[name=login]').show();
//            this.down('[name=register]').show();
//        }
    }
});
