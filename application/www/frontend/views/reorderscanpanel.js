
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
        this.bindingId = 1;
        this.store = Ext.create('Ext.ux.StoreBase', {model: 'Ext.ux.ScanModel'});
        this.store.filter({property: 'bindingId', value: this.bindingId});
        this.store.load();
        
        var defConfig = {
            items: [{
                xtype: 'multiselect',
                name: 'scans',
                width: 400,
                height: 400,
                allowBlank: true,
                ddReorder: true,
                store: this.store,
                displayField: 'scanId',
                tbar: [{
                    text: 'Go back to old ordening',
                    handler: function() {
                        this.down('[name=scans]').bindStore(fields);
                    }
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
    ,
    getNewOrder: function()
    {
        return this.down('[name=scans]').store;
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
                xtype: 'reorderscanfieldset',
                name: 'reorder',
                binding: this.binding
            }],
            
            submitButtonText: 'Save'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        //Put the changes into an array
        var records=this.down('[name=reorder]').store;
        var fields = new Array();
        records.each(function(record)
        {
            var scanId=record.get('scanId');
            var i=records.indexOf(record);
            fields[i]=scanId;
        });
        
        // Send the changes to the database
        var onSuccess = function(data)
        {
            //TODO: Go to next step of the wizard
        };
            
        var onFailure = function()
        {
            alert('Failed to change the order. Please try again.'); //Different kind of error?
        };
        
        RequestManager.getInstance().request('Scan', 'reorder', fields, this, onSuccess, onFailure);
    }
});
