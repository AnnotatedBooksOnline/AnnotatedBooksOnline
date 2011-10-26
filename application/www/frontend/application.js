/*
 * Application.
 */

var application;

Ext.require(['*']);
Ext.onReady(function()
{
    Ext.History.init();
    
    var topRegion = {
        height: 100,
        border: false,
        tbar: [{
            text: 'Book',
            menu: [{
                text: 'Save current page...'
            },{
                text: 'Go to page...'
            },{
                text: 'Print...'
            },{
                text: 'Close'
            }]
        },{
            text: 'Viewer',
            menu: [{
                text: 'Reset'
            },{
                text: 'Viewer settings...'
            }]
        }, '->', {
            text: 'Options',
            menu: [{
                text: 'Profile...'
            },{
                text: 'Viewer settings...'
            }]
        },{
            text: 'Help'
        }, '-', {
            text: 'Logout'
        }],
        html: '(This panel will contain some books to open)'
    };
    
    var bottomRegion = {
        xtype: 'viewerpanel',
        flex: 1
    };
    
    
    application = Ext.create('Ext.Viewport', {
        id: 'application',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [topRegion, bottomRegion]
    });
    
    /*

    // Needed if you want to handle history for multiple components in the same page.
    // Should be something that won't be in component ids.
    var tokenDelimiter = ':';

    function onTabChange(tabPanel, tab) {
        var tabs = [],
            ownerCt = tabPanel.ownerCt, 
            oldToken, newToken;

        tabs.push(tab.id);
        tabs.push(tabPanel.id);

        while (ownerCt && ownerCt.is('tabpanel')) {
            tabs.push(ownerCt.id);
            ownerCt = ownerCt.ownerCt;
        }
        
        newToken = tabs.reverse().join(tokenDelimiter);
        
        oldToken = Ext.History.getToken();
       
        if (oldToken === null || oldToken.search(newToken) === -1) {
            Ext.History.add(newToken);
        }
    }

    // Handle this change event in order to restore the UI to the appropriate history state
    function onAfterRender() {
        Ext.History.on('change', function(token) {
            var parts, tabPanel, length, i;
            
            if (token) {
                parts = token.split(tokenDelimiter);
                length = parts.length;
                
                // setActiveTab in all nested tabs
                for (i = 0; i < length - 1; i++) {
                    Ext.getCmp(parts[i]).setActiveTab(Ext.getCmp(parts[i + 1]));
                }
            }
        });
        
        // This is the initial default state.  Necessary if you navigate starting from the
        // page without any existing history token params and go back to the start state.
        var activeTab1 = Ext.getCmp('main-tabs').getActiveTab(),
            activeTab2 = activeTab1.getActiveTab();
            
        onTabChange(activeTab1, activeTab2);
    }
    
    var loginForm = {
        xtype: 'form',
        border: false,
        
        url: 'login.php',
        
        bodyPadding: 5,
        
        layout: 'anchor',
        defaults: {
            labelWidth: 120,
            anchor: '100%'
        },
        
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'Username',
            name: 'username',
            allowBlank: false
        },{
            fieldLabel: 'Password',
            name: 'password',
            vtype: 'password',
            allowBlank: false
        }],

        buttons: [{
            text: 'Login',
            formBind: true,
            disabled: true,
            handler: function()
            {
                var form = this.up('form').getForm();
                if (form.isValid())
                {
                    form.submit({
                        success: function(form, action)
                        {
                            //Ext.Msg.alert('Success', action.result.msg);
                        },
                        failure: function(form, action)
                        {
                            //Ext.Msg.alert('Failed', action.result.msg);
                        }
                    });
                }
            }
        },{
            text: 'Cancel'
        }]
    };
    
    var loginWindow = new Ext.Window({
        id: 'login-window',
        title: 'Login to continue',
        layout: 'fit',
        width: 600,
        height: 400,
        closable: true,
        resizable: true,
        draggable: true,
        modal: true,
        border: true,
        items: [{
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [loginForm, {
                width: '100%',
                border: false,
                html: 'some text'
            }]
        }]
    });
    
    loginWindow.show();
    
    //---
    
    var profileForm = {
        xtype: 'form',
        border: false,
        
        url: 'edit-profile.php',
        
        bodyPadding: 5,
        
        layout: 'anchor',
        defaults: {
            labelWidth: 120,
            anchor: '100%'
        },
        
        defaultType: 'textfield',
        items: [{
            fieldLabel: 'Name',
            name: 'name',
            allowBlank: false
        },{
            fieldLabel: 'Email',
            name: 'email',
            vtype: 'email'
        },{
            fieldLabel: 'Some other field',
            name: 'other'
        }],

        buttons: [{
            text: 'Save',
            formBind: true,
            disabled: true,
            handler: function()
            {
                var form = this.up('form').getForm();
                if (form.isValid())
                {
                    form.submit({
                        success: function(form, action)
                        {
                            Ext.Msg.alert('Success', action.result.msg);
                        },
                        failure: function(form, action)
                        {
                            Ext.Msg.alert('Failed', action.result.msg);
                        }
                    });
                }
            }
        },{
            text: 'Cancel'
        }]
    };
    
    var profileWindow = new Ext.Window({
        id: 'profile-window',
        title: 'Edit profile',
        layout: 'fit',
        width: 500,
        height: 300,
        closable: true,
        resizable: true,
        draggable: true,
        modal: true,
        border: true,
        items: [profileForm]
    });
    
    profileWindow.show();
    
    */
});
