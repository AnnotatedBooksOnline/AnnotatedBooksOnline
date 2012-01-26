/*
 * Reorder scan fieldset class.
 */

// TODO : mathijsB . rewrite a lot in this file.

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
                    style: 'margin-right: 5px; margin-top: 5px;',
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
                    style: 'margin-top: 5px;',
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
                text: 'Reset order',
                style: 'margin-bottom: 5px',
                iconCls: 'undo-icon',
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
        _this.store.filter('bindingId', this.bindingId);
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
                name: 'delete',
                iconCls: 'cancel-icon',
                text: 'Delete',
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: ' This binding will be deleted. Are you sure?',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.QUESTION,
                        callback: function(button)
                        {
                            if (button == 'yes')
                            {
                                _this.deleteBinding();
                            }
                        }
                    });
                }
            },{
                xtype: 'button',
                disabled: false,
                name: 'save',
                text: 'Save',
                iconCls: 'accept-icon',
                width: 140,
                handler: function()
                {
                    _this.submit();
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
        
        RequestManager.getInstance().request(
            'Scan',
            'reorder',
            {
                bindingId: this.bindingId,
                orderedScans: orderedScanIds,
                deletedScans: deletedScanIds
            },
            this,
            onSuccess
        );
    },
    deleteBinding: function()
    {
        // Send the drop request to the database
        var onSuccess = function(data)
        {
            Ext.Msg.show({
                title: 'Success',
                msg: 'The binding was successfully deleted.',
                buttons: Ext.Msg.OK
            }); 
            
            this.close();
        };
        
        RequestManager.getInstance().request(
            'BindingUpload', 
            'deleteUpload', 
            {bindingId: this.bindingId},
            this,
            onSuccess
        );
    }
});
