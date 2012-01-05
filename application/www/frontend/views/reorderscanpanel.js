
/*
 * Reorder scan fieldset class.
 */
 
var store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
    
Ext.define('Ext.ux.ReorderScanFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.reorderscanfieldset',
    title: 'Scans',
    collapsible: false,
    
    initComponent: function()
    {
        var _this = this;
        var bindingId = 1;
        
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this, 
            function(result)
            {
                if (result['status'] === 0)
                {
                    bindingId = result['bindingId'];
                    store.filter({property: 'bindingId', value: bindingId});
                    store.load();
                }
                else
                {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'This step of the uploading process is currently unavailable',
                        buttons: Ext.Msg.OK
                    });
                    this.up('reorderscanform').close();
                }
            }, 
            function()
            {
                 Ext.Msg.show({
                            title: 'Error',
                            msg: 'There is a problem with the server. PLease try again later',
                            buttons: Ext.Msg.OK
                        });
                this.close();
            });
        
        var defConfig = {
            items: [{
                xtype: 'multiselect',
                name: 'scans',
                width: 400,
                height: 400,
                allowBlank: true,
                ddReorder: true,
                store: store,
                displayField: 'filename',
                tbar: [{
                    text: 'Go back to old ordening',
                    handler: function() {
                        this.up('[name=scans]').store.sort('page', 'ASC');
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
        var records=store;
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
                Ext.Msg.show({
                title: 'Success',
                msg: 'The pages were succesfully reordered.',
                buttons: Ext.Msg.OK}); 
                Application.getInstance().gotoTab('selectbook',[],true);
                this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
           Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to reorder the pages. Please try again.',
                buttons: Ext.Msg.OK}); 
        };
        
        RequestManager.getInstance().request('Scan', 'reorder', fields, this, onSuccess, onFailure);
    }
});
