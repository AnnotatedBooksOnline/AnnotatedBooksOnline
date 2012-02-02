/*
 * Welcome panel class.
 */

Ext.define('Ext.ux.Activation', {
    extend: 'Ext.Panel',
    alias: 'widget.activationpanel',
    
    initComponent: function() 
    {                
        var config = 
        {
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
                    items: []
                    },
                ]
        };
        
        // Send request with activation token from URL.
        var token = this.tabInfo.data[0];
        var _this = this;
        RequestManager.getInstance().request(
            'UserActivation',
            'activateUser',
            {token: token},
            _this,
            function(success)
            {
                if (success)
                {
                    _this.add({
                        xtype: 'container',
                        items: {
                            style: 'text-align: justify;',
                            xtype: 'panel',
                            border: false,
                            width: 500,
                            flex: 0,
                            html: 'Your account has been succesfully activated. ' +
                                  '<a href="#" title="" onclick="Authentication.showLoginWindow(); return false;">' +
                                  'Please click here to login.</a>'
                        }
                    })
                }
                else
                {
                    _this.add({
                        xtype: 'container',
                        items: {
                            style: 'text-align: justify;',
                            xtype: 'panel',
                            border: false,
                            width: 500,
                            flex: 0,
                            html: 'Your account could not be activated. Please try again or request a new confirmation ' +
                                  'link by logging in.'
                        }
                    })
                }
                
                
                
            },
            function(data)
            {
                _this.add({
                    xtype: 'container',
                    items: {
                        style: 'text-align: justify;',
                        xtype: 'panel',
                        border: false,
                        width: 500,
                        flex: 0,
                        html: 'Your account could not be activated. Please try again or request a new confirmation ' +
                              'link by logging in.'
                    }
                })
            }
        );
        
        Ext.apply(_this, config);
        this.callParent();
    }
});
