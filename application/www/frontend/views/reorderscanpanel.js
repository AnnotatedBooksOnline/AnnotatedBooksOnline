/*
 * Reorder scan fieldset class.
 */

// TODO: Get rid of these globals! Make them class statics, or class fields.
// TODO : mathijsB . rewrite a lot in this file.

//var store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
//var bindingId;

Ext.define('Ext.ux.ReorderScanFieldset', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.reorderscanfieldset',
    title: 'Scans',
    collapsible: false,
    
    initComponent: function()
    {
        var defConfig = {
            items: [{
                xtype: 'container',
                layout: {
                    align: 'left',
                    type: 'hbox'
                },
                items: [{
                    xtype: 'multiselect',
                    name: 'scans',
                    width: 400,
                    height: 400,
                    allowBlank: true,
                    ddReorder: true,
                    store: this.store,
                    displayField: 'scanName',
                    dragGroup:'scans',
                    dropGroup:'scans',
                    tbar: [{
                        text: 'Scan order in binding',
                        xtype: 'label'
                    }]
                },{
                    xtype: 'multiselect',
                    name: 'deletedscans',
                    width: 400,
                    height: 400,
                    allowBlank: true,
                    store: this.deletedScanStore,
                    displayField: 'scanName',
                    dragGroup:'scans',
                    dropGroup:'scans',
                    tbar: [{
                        text: 'Deleted scans (drag here to delete)',
                        xtype: 'label'
                    }]
                }]
            },{
                xtype: 'button',
                text: 'Go back to old ordening',
                handler: function()
                {
                    // Reload the store from server.
                    this.up('[name=reorderscanform]').store.load();
                    // Reset deleted scans.
                    this.up('[name=reorderscanform]').deletedScanStore.removeAll(false);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // Hide the deleted scans list for new binding.
        if (this.isExistingBinding === false)
        {
            this.down('[name=deletedscans]').hide(true);
        }
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
        
        // Load all scans for this binding.
        _this.store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
        _this.store.filter({property: 'bindingId', value: this.bindingId});
        _this.store.load();

        _this.deletedScanStore = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});

        var defConfig = {
            name: 'reorderscanform',
            selectFirstField: false,
            items: [{
                xtype: 'bindinginformationfieldset'
            },{
                xtype: 'reorderscanfieldset',
                name: 'reorder',
                store: this.store,
                deletedScanStore: this.deletedScanStore
            }],
            buttons: [{
                xtype: 'button',
                disabled: true,
                name: 'save',
                text: 'Save',
                width: 140,
                handler: function()
                {
                    _this.submit();
                }
            },{
                xtype: 'button',
                name: 'dropUpload',
                text: 'Drop current upload',
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: ' All uploaded data will be lost. Are you sure you want to drop this upload?.',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                            {
                                if (button == 'yes')
                                {
                                    _this.drop();
                                }
                            }
                    });
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    submit: function()
    {
        var _this = this;
        
        var orderedScanIds = [];
        this.store.each(function(record)
        {
            var scanId = record.get('scanId');
            orderedScanIds.push(scanId);
        });
        
        var deletedScanIds  = [];
        this.deletedScanStore.each(function(record)
        {
            var scanId = record.get('scanId');
            deletedScanIds.push(scanId);
        });
        
        
        // Send the changes to the database.
        var onSuccess = function(data)
        {         
            Application.getInstance().gotoTab('selectbook', [this.bindingId, this.isExistingBinding], true);   
            this.close();
        };
        
        // Show an error.
        var onFailure = function()
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to reorder the pages. Please try again.',
                buttons: Ext.Msg.OK
            }); 
        };
        
        RequestManager.getInstance().request(
            'Scan', 
            'reorder', 
            {
                bindingId: this.bindingId,
                orderedScans: orderedScanIds,
                deletedScans: deletedScanIds
            },
            this, 
            onSuccess, 
            onFailure
        );
    },
    drop: function()
    {
        // Send the drop request to the database
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The upload was dropped.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        //Show an error
        var onFailure = function()
        {
            Ext.Msg.show({
                title: 'Error',
                msg: 'Failed to drop the upload. Please try again.',
                buttons: Ext.Msg.OK
            }); 
        };
        RequestManager.getInstance().request(
                'BindingUpload', 
                'dropUpload', 
                {
                    bindingId:this.bindingId
                },
                this, 
                onSuccess, 
                onFailure);
    }
    
});
