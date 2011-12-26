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
        
        // TODO: get from database.
        var bindingId = 0;
        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });
        
        //store.load();
        
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
                //store: store,
                source: {},
                listeners: {
                    // Prevent editing
                    beforeedit: function() {
                        return false;
                    }
                },
                hideHeaders: true
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});