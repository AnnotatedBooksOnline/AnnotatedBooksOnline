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
                    this.up('[name=reorderscanform]').store.load();
                    
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
            
            // Gives the alphabet position of characters between A and Z. Returns 0 for others.
            function letterVal(x)
            {
                if(x >= 'A' && x <= 'Z')
                {
                    return x.charCodeAt(0) - 64;
                }
                else if(x >= 'a' && x <= 'z')
                {
                    return x.charCodeAt(0) - 96;
                }
                else
                {
                    return 0;
                }
            }
            
            // Tests if a character is a digit.
            function isDigit(x)
            {
                return x >= '0' && x <= '9';
            }
            
            /*
             * Iterate through the strings and compare characters in the following matter:
             * 
             * - Compare lower and upper case letters from the Latin alphabet on their position in that alphabet.
             * - Digits go before letters. When encountering a digit in both strings, keep iterating until 
             *   encounter the end or a non-digit and compare the resulting integers.
             * - Bytes that do not represent ASCII digits or alphabetical characters go before those two and are
             *   compared by value. This implies UTF8 sequences outside of ASCII are compared lexicographically.
             */
            var i = 0, j = 0;
            for(; i < a.length && j < b.length; ++i, ++j)
            {
                var c1 = a[i];
                var c2 = b[i];
                
                // If c1 == c2, they're considered equal either way.
                if(c1 == c2)
                {
                    continue;
                }
                
                var l1 = letterVal(c1);
                var l2 = letterVal(c2);
                
                if(l1 != 0)
                {
                    if(l2 == 0)
                    {
                        // Non-letters go before letters. Therefore a is considered higher.
                        return 1;
                    }
                    else
                    {
                        if(l1 != l2)
                        {
                            return l1 - l2;
                        }
                    }
                }
                else if(l2 != 0)
                {
                    return -1;
                }
                
                var d1 = isDigit(c1);
                var d2 = isDigit(c2);
                if(d1)
                {
                    if(d2)
                    {
                        // Two digits, start comparing the whole integer.
                        var n1 = c1;
                        for(; i < a.length; ++i)
                        {
                            if(isDigit(a[i]))
                            {
                                n1 += a[i];
                            }
                            else
                            {
                                break;
                            }
                        }
                        var n2 = c2;
                        for(; j < b.length; ++j)
                        {
                            if(isDigit(b[j]))
                            {
                                n2 += b[j];
                            }
                            else
                            {
                                break;
                            }
                        }
                        
                        n1 = parseInt(n1);
                        n2 = parseInt(n2);
                        if(n1 != n2)
                        {
                            return n1 - n2;
                        }
                    }
                    else
                    {
                        // The second character is no digit, so it should go first. Therefore a is higher.
                        return 1;
                    }
                }
                else if(d2)
                {
                    return -1;
                }
                
                // Neither are digit nor alphabetic, compare byte values (equality has already been tested).
                return c1 - c2;
            }
            
            // When reaching the end of either string, compare their lengths.
            return a.length - b.length;
        }
        
        // This comparator orderns scans by page number.
        function scanComparePage(scan1, scan2)
        {
            //if(scan1.get('page') <= 2) alert("" + scan1.get('scanName') + ": " + scan1.get('status'));
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
        var storeSorter;
        if(this.isExistingBinding)
        {
            storeSorter = [{sorterFn: scanCompareEditMode}];
        }
        else
        {
            storeSorter = [{sorterFn: scanCompareNatural}];
        }
        
        this.store = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel', sorters: storeSorter});
        this.store.filter('bindingId', this.bindingId);
        
        //this.deletedScanStore = Ext.create('Ext.data.Store', {model: 'Ext.ux.ScanModel'});

        // A temporary solution to the problem of accessing upload panels through url
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this,
            function(result)
            {
                if (result['status'] == 0 && result['bindingId'] == this.bindingId && this.bindingId !== undefined)
                {
                    this.store.load();
                }
                else
                {
                    Ext.Msg.show({
                        title: 'Error',
                        msg: 'This step of the uploading process is currently unavailable for this binding.',
                        buttons: Ext.Msg.OK
                    });
                    this.close();
                }
            },
            function()
            {
                 Ext.Msg.show({
                    title: 'Error',
                    msg: 'There is a problem with the server. Please try again later.',
                    buttons: Ext.Msg.OK
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
                text: 'Delete',
                hidden: this.isExistingBinding,
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
            this.close();
        };
        
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
