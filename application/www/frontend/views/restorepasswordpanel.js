
/*
 * Password restoration form.
 */
Ext.define('Ext.ux.RestorePasswordForm', {
	extend: 'Ext.Panel',
    alias: 'widget.restorepasswordform',
    
    initComponent: function() 
    {  
    	var _this = this;
    	
    	var defConfig = {
                items: [{
                    name: 'password',
                    fieldLabel: 'Password *',
                    inputType: 'password',
                    style: 'margin-top: 15px',
                    minLength: 8,
                    maxLength: 32
                },{
                    name: 'repeatPassword',
                    fieldLabel: 'Repeat password *',
                    inputType: 'password',
                    
                    // Custom validator implementation - checks that the value matches what was entered
                    // into the repeat password field.
                    validator: function(value)
                    {
                        var password = this.previousSibling('[name=password]');
                        return (value === password.getValue()) ? true : 'Passwords do not match.';
                    }
                }
                ],
                
                submitButtonText: 'Ok',
                
                model: new Ext.ux.UserModel()
            };
        
    	Ext.apply(_this, defConfig);
    	this.callParent();
    }
});

/*
 * Password restoration panel.
 */
Ext.define('Ext.ux.RestorePasswordPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.restorepasswordpanel',
    
    initComponent: function() 
    {  
    	// Send request with token from URL.
    	var token = this.tabInfo.data[0];
    	var _this = this;
    	
    	//TODO ....
    	
    	var defConfig = {
    			layout: 'card',
                activeItem: 0,
                items: [{
                    xtype: 'restorepasswordform'
                },{
                    html: '',
                    bodyPadding: 10
                }]
            };
        
    	Ext.apply(_this, defConfig);
    	this.callParent();
    }
});
