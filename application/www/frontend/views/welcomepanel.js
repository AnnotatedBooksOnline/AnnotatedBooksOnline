/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Welcome', {
    extend: 'Ext.form.Panel',
    alias: 'widget.welcomepanel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        
        var text = new Ext.Container({
            // TODO: get from database
            html: '<h1>Welcome</h1><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p><p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>'
        });
        
        var loginButton = new Ext.Button({
            text: 'Login',
            scale: 'large',
            handler: function() {
                Authentication.showLoginWindow();
            }
        });
        
        var logoutButton = new Ext.Button({
            text: 'Logout',
            scale: 'large',
            iconCls: 'logout-icon',
            handler: function() {
                Authentication.getInstance().logout();
            }
        });
        
        var registerButton = new Ext.Button({
            text: 'Register',
            scale: 'large',
            handler: function() {
                Application.getInstance().gotoTab('register', [], true);
            }
        });
        
        var searchButton = new Ext.Button({
            text: 'Search',
            scale: 'large',
            handler: function() {
                Application.getInstance().openTab('search', [], true);
            }
        });
        
        var uploadButton = new Ext.Button({
            text: 'Upload',
            scale: 'large',
            handler: function() {
                Application.getInstance().openTab('upload', [], true);
            }
        });
        
        var infoButton = new Ext.Button({
            text: 'Info',
            scale: 'large',
            handler: function() {
                Application.getInstance().openTab('info', [], true);
            }
        });
        
        var moderateButton = new Ext.Button({
            text: 'Moderate',
            scale: 'large',
            handler: function() {
                // TODO: change 'info' to 'moderate' page, doesn't exist at this moment
                Application.getInstance().openTab('info', [], true);
            }
        });
        
        var anonymousConfig = {
            bodyPadding: 10,
            items: [{
                defaults: {
                    style: 'margin-right: 5px;'
                },
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [registerButton, loginButton, searchButton, infoButton]
            },text]
        };
        
        var userConfig = {
            bodyPadding: 10,
            items: [{
                defaults: {
                    style: 'margin-right: 5px;'
                },
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [logoutButton, searchButton, uploadButton, infoButton]
            },text]
        };
        
        var moderatorConfig = {
            bodyPadding: 10,
            items: [{
                defaults: {
                    style: 'margin-right: 5px;'
                },
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [logoutButton, searchButton, uploadButton, moderateButton] 
            },text]
        };
        
        Ext.apply(this, anonymousConfig);
        
        this.callParent();
    }
});
