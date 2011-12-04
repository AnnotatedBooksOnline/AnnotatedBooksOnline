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
                html: '<h1>Welcome</h1><p>This project seeks to develop a virtual research ' +
                      'environment (or collaboratory) and publication platform for a young and ' +
                      'growing field in cultural history: the study of early modern reading ' +
                      'practices. Proceeding from the idea that reading constitutes a crucial ' +
                      'form of intellectual exchange, the collaborators will collect and enhance ' +
                      'evidence of how readers used their books to build knowledge and ' +
                      'assimilate ideas. This is especially pertinent since the early modern ' +
                      'period, just like the twenty-first century, saw the revolutionary rise of ' +
                      'a new medium of communication which helped shape cultural formation and ' +
                      'intellectual freedom.</p><p>Although widely recognized as a promising ' +
                      'approach with important theoretical implications, currently the study of ' +
                      'reading practices still largely depends on individual researchers, whose ' +
                      'work is seriously hampered by the limited access to an inherently ' +
                      'fragmented body of material. The proposed collaboratory will connect ' +
                      'scholarly expertise and provide added value to digital sources through ' +
                      'user-generated content (e.g. explanatory material or fuller scholarly ' +
                      'syntheses) in an electronic environment specifically designed for ' + 
                      'research and teaching purposes. It will offer, in short, an academic ' +
                      'Wikipedia for the history of reading and the circulation of ideas.</p>' +
                      '<p>The project will create a transnational platform that enables scholars ' +
                      'to (1) view, connect and study annotated books and readers&#39; notes, ' +
                      '(2) offer training to students and young researchers in handling ' +
                      'readers&#39; traces, and (3) make results freely accessible for teaching ' +
                      'purposes, as well as for broader general interest by means of exhibitions, ' +
                      'digital presentations and general publications. In order to expand this ' +
                      'structural network, the principal partners in the collaboratory will ' + 
                      'prepare an application for a Marie Curie Initial Training Network.</p>'
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
                    uploadButton, infoButton, moderateButton
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
