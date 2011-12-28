/*
 * References panel class.
 */
Ext.define('Ext.ux.ReferencesPanel', {
    extend: 'Ext.panel.Panel',
    alias : 'widget.referencespanel',

    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            border: false,
            flex: 0,
            height: 600,
            items: [{
                xtype: 'textfield',
                name: 'bindinglink',
                fieldLabel: 'Link to this binding ('+this.binding.get('signature')+
                                                   ','+this.binding.get('library').libraryName+')',
                labelAlign: 'top',
                readOnly : true,
                value : document.domain+'/#binding-'+this.binding.get('bindingId')
            },{
                xtype: 'textfield',
                name: 'booklink',
                fieldLabel: 'Link to this book ('+')',
                labelAlign: 'top',
                readOnly : true,
                value : document.domain+'/#binding-'+this.binding.get('bindingId')
            },{
                xtype: 'textfield',
                name: 'pagelink',
                fieldLabel: 'Link to this page',
                labelAlign: 'top',
                readOnly : true
            }]
        };
        Ext.apply(this, defConfig);
        
        // Watch for page changes and update fields accordingly.
        //TO DO: update booklink.
        this.viewer.getEventDispatcher().bind('pagechange', this,
        function()
        {
            this.down('[name=pagelink]').setValue(document.domain+
                                               '/#binding-'+this.binding.get('bindingId')+
                                               '-'+(this.viewer.pageNumber+1));
        });
        this.callParent();
    }
});
