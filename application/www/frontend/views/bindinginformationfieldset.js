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
        
        
        RequestManager.getInstance().request('BindingUpload', 'getBindingStatus', [], this, 
            function(result)
            {
                    Ext.ux.BindingModel.load(result['bindingId'], 
                    {
                        scope: this,
                        failure: function(record, operation) {
                            //handleError
                            return undefined;
                        },
                        success: function(record, operation) {
                            this.down('propertygrid').setSource({
                                "library": record.get('library').libraryName,
                                "signature": record.get('signature'),
                                "provenance": 'provenances',
                                "languagesOfAnnotations": 'languages'
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
                    library: 'Library',
                    signature: 'Signature',
                    provenance: 'Provenance',
                    languagesOfAnnotations: 'Languages of annotations'
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