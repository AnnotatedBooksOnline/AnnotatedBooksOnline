var application;

Ext.require(['*']);
Ext.onReady(function()
{
	Ext.History.init();

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

	*/
	
	var northRegion = {
		region: 'north',
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
				text: 'Profile'
			},{
				text: 'Viewer settings'
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
		}]
	};
	
	application = Ext.create('Ext.Viewport', {
		layout: {
			type: 'border',
			padding: 5
		},
		defaults: {
		},
		items: [
			northRegion,{
				region: 'west',
				title: 'Inhoudsopgave',
				collapsible: true,
				split: true,
				width: 200,
				html: '(This will be a viewportnavigation panel)'
			},{
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
			},{
				region: 'east',
				title: 'Information',
				collapsible: true,
				collapsed: true,
				width: 200,
				html: '(This will be a viewportinformation panel)'
			}
		]
	});
});