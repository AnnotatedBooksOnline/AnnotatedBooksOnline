/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Welcome', {
    extend: 'Ext.Panel',
    alias: 'widget.welcomepanel',
    
    initComponent: function() 
    {
        var text = {
            // TODO: get from database
            xtype: 'container',
            items: {
                style: 'text-align: justify;',
                xtype: 'panel',
                border: false,
                width: 500,
                flex: 0,
                html: '<h1>Welcome</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing ' +
                      'elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
                      'Ut enim ad minim veniam, quis nostrud exercitaion ullamco laboris nisi ut ' +
                      'aliquip ex ea commodo consequat. Duis aue irure dolor in reprehenderit in ' +
                      'voluptate velit esse cillum dolore eu fugat nulla paritur. Excepteur sint ' +
                      'occaecat cupidatat non proident, sunt in culpa qui offcia deserunt mollit ' +
                      'anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natuserror ' +
                      'sit voluptatem accusantium doloremque laudantium, tota rem aperiam, eaque ' +
                      'ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae ' +
                      'dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit ' +
                      'aspernatur aut odit aut fugit, sed qui consequuntur magni dolores eos qui ' +
                      'ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ' +
                      'ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non ' +
                      'numquam eius modi tempora incidunt ut labore et dolore magnam aliquam ' +
                      'quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitatonem ' +
                      'ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi ' +
                      'consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate ' +
                      'velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum ' +
                      'fugiat quo voluptas nulla pariatur?</p><p>At vero eos et accusamus et ' +
                      'iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum ' +
                      'deleniti atque corrupti quos dolores et quas molestias excepturi sint ' +
                      'occaecati cupiditate non provident, similique sunt in culpa qui officia ' +
                      'deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem ' +
                      'rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta ' +
                      'nobis est eligendi optio cumque nihil impedit quo minus id quod maxime ' +
                      'placeat facere possimus, omnis voluptas assumenda est, omnis dolor ' +
                      'repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum ' +
                      'necessitatibus saepe eveniet ut et voluptates repudiandae sint et ' +
                      'molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente ' +
                      'delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut ' +
                      'perferendis doloribus asperiores repellat.</p>'
            }
        };
        
        var buttonWidth = 100;
        
        var loginButton = {
            xtype: 'button',
            name: 'login',
            text: 'Login',
            scale: 'large',
            width: buttonWidth,
            handler: function()
            {
                Authentication.showLoginWindow();
            }
        };
        
        var logoutButton = {
            xtype: 'button',
            name: 'logout',
            text: 'Logout',
            scale: 'large',
            iconCls: 'logout-icon',
            hidden: true,
            width: buttonWidth,
            handler: function()
            {
                Authentication.getInstance().logout();
            }
        };
        
        var registerButton = {
            xtype: 'button',
            name: 'register',
            text: 'Register',
            scale: 'large',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().gotoTab('register', [], true);
            }
        };
        
        var searchButton = {
            xtype: 'button',
            name: 'search',
            text: 'Search',
            scale: 'large',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().openTab('search', [], true);
            }
        };
        
        var uploadButton = {
            xtype: 'button',
            name: 'upload',
            text: 'Upload',
            scale: 'large',
            hidden: true,
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().gotoTab('upload', [], true);
            }
        };
        
        var infoButton = {
            xtype: 'button',
            name: 'info',
            text: 'Info',
            scale: 'large',
            width: buttonWidth,
            handler: function()
            {
                Application.getInstance().gotoTab('info', [], true);
            }
        };
        
        var moderateButton = {
            xtype: 'button',
            name: 'moderate',
            text: 'Moderate',
            scale: 'large',
            hidden: true,
            width: buttonWidth,
            handler: function()
            {
                // TODO: change 'info' to 'moderate' page, doesn't exist at this moment
                Application.getInstance().gotoTab('info', [], true);
            }
        };
        
        var defConfig = {
            bodyPadding: 10,
            items: [{
                xtype: 'container',
                width: 500,
                style: 'margin-bottom: 20px',
                layout: {
                    type: 'hbox',
                    pack: 'center'
                },
                defaults: {
                    style: 'margin-right: 5px;'
                },
                items: [
                    registerButton, loginButton, logoutButton, searchButton,
                    /*uploadButton, */infoButton, moderateButton
                ]
            }, text]
        };
        
        Ext.apply(this, defConfig);
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('change', this, this.onAuthenticationChange);
        
        // TODO: Say "Hello, <user>" or so.
        //eventDispatcher.bind('modelchange', this, this.onAuthenticationModelChange);
        
        this.callParent();
    },
    
    onAuthenticationChange: function(event, authentication)
    {
        if (authentication.isLoggedOn())
        {
            //this.down('[name=users]').show();
            //this.down('[name=upload]').show();
            this.down('[name=logout]').show();
            this.down('[name=login]').hide();
            this.down('[name=register]').hide();
        }
        else
        {
            //this.down('[name=users]').hide();
            //this.down('[name=upload]').hide();
            this.down('[name=logout]').hide();
            this.down('[name=login]').show();
            this.down('[name=register]').show();
        }
    }
});
