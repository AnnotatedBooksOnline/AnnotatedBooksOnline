var application;

Ext.require(['*']);
Ext.onReady(function()
{
    //Menu
	var northRegion = {
		region: 'north',
		height: 28,
		border: false,
		tbar: [{
			text: 'Settings',
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
			text: 'Settings of page',
			menu: [{
				text: 'Reset'
			},{
				text: 'Viewer settings...'
			}]
		}, '->', {
			text: 'Home'
		}, {
			text: 'Admin'
		},'-',{
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
		}, {
			text: 'Register'
		}, {
			text: 'Login'
		}]
	};
	/*
	var westRegion = {
		region: 'west',
		title: 'Navigation',
		collapsible: true,
		split: true,
		width: 200,
		html: '(This is the west region)'
	};*/
    
    var westRegion = {
        region: 'west',
        xtype: 'loginpanel',
        title: 'not login',
        collapsible: true,
        split: true
    };
	
	var centerRegion = {
		region: 'center',
		xtype: 'tabpanel',
		activeTab: 0,
		plain: true,
		defaults: {
			closable: true
		},
		items: [{
			title: 'Book 1',
			xtype: 'viewportpanel'
		},{
			title: 'Book 2',
			xtype: 'viewportpanel'
		},{
			title: 'Book 3',
			xtype: 'viewportpanel'
		},{
			title: 'Book 4',
			xtype: 'viewportpanel'
		}]
		/*,
		listeners: {
			tabchange: onTabChange,
			afterrender: onAfterRender 
		}
		*/
	};
	
	var eastRegion = {
		region: 'east',
		title: 'Book information',
		xtype: 'informationpanel',
		collapsible: true,
		collapsed: true,
		width: 200
	};
	
	application = Ext.create('Ext.Viewport', {
		id: 'application',
		layout: {
			type: 'border',
			padding: 5
		},
		items: [northRegion, westRegion, centerRegion, eastRegion]
	});
	
	//---
	
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
});