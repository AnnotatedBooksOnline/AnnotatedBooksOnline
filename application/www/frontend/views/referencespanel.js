// Override basic Extjs functionality in order to enable changing labels
// during runtime.
Ext.override(Ext.form.Field, {
    setFieldLabel: function(label)
    {
        if (this.rendered)
        {
            Ext.get(this.labelEl.id).update(label);
        }
        
        this.fieldLabel = label;
    }
});

/*
 * References panel class.
 */

Ext.define('Ext.ux.ReferencesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.referencespanel',
    
    initComponent: function()
    {
        // Get binding model from viewer.
        this.bindingModel = this.viewer.getBinding().getModel();
        
        //Calculate url prefix.
        this.urlPrefix = location.protocol + '//'
                       + location.hostname + location.pathname
                       +'#view';
        
        var _this = this;
        var defConfig = {
            border: false,
            bodyPadding: 5,
            layout: 'anchor',
            items: [{
                xtype: 'textfield',
                name: 'page-link',
//                fieldLabel: 'Link to this page',
                labelAlign: 'top',
                readOnly: true,
                labelStyle: 'white-space: nowrap',
                size: 50,
                anchor: '100%',
                listeners:
                    {
                        focus: function()
                        {
                            this.selectText();
                        }
                    }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Watch for page changes and update fields accordingly.
        this.viewer.getEventDispatcher().bind('pagechange', this, this.setValues);
        this.setValues();
    },
    
    setValues: function()
    {
        // Set page field link.
        this.down('[name=page-link]').setValue(this.urlPrefix + '-' + (this.viewer.getPage() + 1));
    }
});
