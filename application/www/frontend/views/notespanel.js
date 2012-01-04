/*
 * Note panel class.
 */

Ext.define('Ext.ux.Notespanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.notespanel',
    
    initComponent: function()
    {
        var _this = this;

        Ext.ux.NotesModel.load(Authentication.getInstance().getUserId(), {
            success: function(user) {
                _this.notes = user;
                _this.notesarea.setValue(user.get('text'));

                _this.setLoading(false);
            },
            failure: function() {alert('notes failed to load');}
        });
        
        var defConfig = {
            border: false,
            layout: 'fit',
            flex: 0,
            height: 600,
            items: [{
                xtype: 'textarea',
                name: 'notes',
                grow: false,
                allowBlank: true,
                listeners: {
                    change: function(comp, newValue, oldValue, obj)
                    {
                        _this.notes.set('text',newValue);
                        _this.notes.save();
                    }
                }
            }]
        };

        Ext.apply(this, defConfig);
        this.callParent();
        
        this.notesarea = this.getComponent(0);
        this.setLoading(true);
    }
});