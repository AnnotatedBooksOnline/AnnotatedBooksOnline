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
                }
                //Commentend because it was unfinished
                //Commentend because it was unfinished
                /*,{
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
                }*/]
            },{
                xtype: 'button',
                text: 'Reset order',
                style: 'margin-bottom: 5px',
                iconCls: 'undo-icon',
                handler: function()
                {
                    // Reload the store from server.
                    var form = this.up('[name=reorderscanform]');
                    form.store.sort(form.storeSorter);
                    
                    // Reset deleted scans.
                    //this.up('[name=reorderscanform]').deletedScanStore.removeAll(false);
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        // Hide the deleted scans list for new binding.
        if (this.isExistingBinding === false)
        {
            //uncomment when it does not cause any bugs
            //this.down('[name=deletedscans]').hide(true);
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
        // Default comparator for new scans. It naturally orders scans by name in a case-insensitive manner. 
        function scanCompareNatural(scan1, scan2)
        {
            // Get names.
            var a = scan1.get('scanName');
            var b = scan2.get('scanName');
            
            return naturalSort(a, b);
        }
        
        // This comparator orderns scans by page number.
        function scanComparePage(scan1, scan2)
        {
            return scan1.get('page') - scan2.get('page');
        }
        
        // This function precedes newly added scans before existing ones.
        // New scans are ordened naturally; old scans are ordered on page number.
        function scanCompareEditMode(scan1, scan2)
        {
            // See which scans are new.
            var s1new = scan1.get('status') < 5;
            var s2new = scan2.get('status') < 5;
            
            if(s1new && s2new)
            {
                return scanCompareNatural(scan1, scan2);
            }
            else if(!s1new && !s2new)
            {
                return scanComparePage(scan1, scan2);
            }
            else if(s1new)
            {
                return -1;
            }
            else
            {
                return 1;
            }
        }
        
        // Automatically sort the scans when editing a newly uploaded binding.
        // When editing an existing binding, sort by page.
        if(this.isExistingBinding)
        {
            this.storeSorter = scanCompareEditMode;
        }
        else
        {
            this.storeSorter = scanCompareNatural;
        }
        
        this.store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});
        this.store.filter('bindingId', this.bindingId);
        
        //this.deletedScanStore = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});

        // A temporary solution to the problem of accessing upload panels through url
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this,
            function(result)
            {
                if (result['status'] == 0 && result['bindingId'] == this.bindingId && this.bindingId !== undefined)
                {
                    this.store.load();
                    this.store.sort([{sorterFn: this.storeSorter}]);
                }
                else if (result['status'] == 0 && this.bindingId !== undefined)
                {
                    Ext.Msg.show({
                        title: 'Information',
                        msg: 'You are currently uploading or modifying another binding. You cannot modify this binding until you have completed your other binding.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                    this.close();
                }
                else
                {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'The scans in this binding cannot be reordered at this moment.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR
                    });
                    this.close();
                }
            },
            function()
            {
                 Ext.Msg.show({
                    title: 'Error',
                    msg: 'There is a problem with the server. Please try again later.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR
                });
                this.close();
            }
        );
        
        var _this = this;
       
        var defConfig = {
            name: 'reorderscanform',
            selectFirstField: false,
            items: [{
                xtype: 'bindinginformationfieldset',
                bindingId: this.bindingId
            },{
                xtype: 'reorderscanfieldset',
                name: 'reorder',
                store: this.store//,
                //deletedScanStore: this.deletedScanStore
            }],
            buttons: [{
                xtype: 'button',
                name: 'delete',
                iconCls: 'cancel-icon',
                text: 'Delete binding',
                hidden: this.isExistingBinding,
                width: 140,
                handler: function()
                {
                    Ext.Msg.show({
                        title: 'Are you sure?',
                        msg: 'This binding will be deleted. Are you sure?',
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
        
        /*var deletedScanIds  = [];
        this.deletedScanStore.each(function(record)
        {
            var scanId = record.get('scanId');
            deletedScanIds.push(scanId);
        });
        */
        // Send the changes to the database.
        var onSuccess = function(data)
        {
            Application.getInstance().gotoTab('selectbook', [this.bindingId, this.isExistingBinding], true);
            this.setLoading(false);
            this.close();
        };
        
        var onFailure = function()
        {
            this.setLoading(false);
            return true;
        };
        
        this.setLoading('Saving...');
        
        RequestManager.getInstance().request(
            'Scan',
            'reorder',
            {
                bindingId: this.bindingId,
                orderedScans: orderedScanIds,
                //empty
                deletedScans: []
            },
            this,
            onSuccess,
            onFailure
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
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
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
