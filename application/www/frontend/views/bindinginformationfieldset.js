/*
 * Binding fieldset class.
 */
Ext.define('Ext.ux.BindingInformationFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.bindinginformationfieldset',
    title: 'Binding information',
    collapsible: true,
    initComponent: function()
    {
        var _this = this;
        
        
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], _this, 
            function(result)
            {
                Ext.ux.BindingModel.load(result['bindingId'], 
                {
                    scope: _this,
                    failure: function(binding, operation) {
                        //handleError
                        return undefined;
                    },
                    success: function(binding, operation) {
                        binding.provenances().load({
                            scope   : _this,
                            callback:function(records, operation, success) {
                                var provenance='';
                                Ext.Array.each(records, function(record) {
                                provenance += (', '+record.get('name'));
                                });
                                
                                this.down('propertygrid').setSource({
                                    "a": binding.get('library').libraryName,
                                    "b": binding.get('signature'),
                                    "c": provenance.substring(1),
                                    "d": 'languages'
                                });
                            }
                        });
                    },
                    callback: function(record, operation) {}
                });
               
            }, 
            function()
            {});
        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });
        
        var defConfig = {
            flex: 1,
            items: [{
                xtype: 'propertygrid',
                propertyNames: {
                    a: 'Library',
                    b: 'Signature',
                    c: 'Provenance',
                    d: 'Languages of annotations'
                },
                source: {},
                listeners: {
                    // Prevent editing
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders: true,
                nameColumnWidth: 200
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});