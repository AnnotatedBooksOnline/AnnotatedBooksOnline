/*
 * Reorder scan fieldset class.
 */
Ext.define('Ext.ux.ReorderScanFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.reorderscanfieldset',
    title: 'Scans',
    collapsible: false,
    
    initComponent: function()
    {
        var _this = this;
        
        // TODO: get from database.
        var bindingId = 0;
        
        var store = [['1', 'one'],['2', 'two'],['3', 'three'],['4', 'four'],['5', 'five']]; /*Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });*/
        
        //store.load();
        
        var defConfig = {
            items: [{
                xtype: 'multiselect',
                name: 'scans',
                width: 400,
                height: 400,
                allowBlank: true,
                ddReorder: true,
                store: store,
                tbar: [{
                    text: 'Go back to old ordening',
                    handler: function() {
                        _this.down('[name=scans]').bindStore(store);
                    }
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

/*
 * Reorder scan form class.
 */
Ext.define('Ext.ux.ReorderScanForm', {
    extend: 'Ext.ux.FormBase',
    alias: 'widget.reorderscanform',
    
    initComponent: function() 
    {
        var _this = this;
        
        var defConfig = {
            items: [{
                xtype: 'bindinginformationfieldset'
            },{
                xtype: 'reorderscanfieldset'
            }],
            
            submitButtonText: 'Save'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        // TODO
    }
});
