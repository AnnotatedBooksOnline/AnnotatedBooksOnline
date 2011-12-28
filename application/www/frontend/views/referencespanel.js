/*
 * References panel class.
 */
Ext.define('Ext.ux.ReferencesPanel', {
    extend: 'Ext.panel.Panel',
    alias : 'widget.referencespanel',

    initComponent: function()
    {
        var _this = this;
        var beginurl=location.protocol+'//'+location.hostname+location.pathname+'#binding-'+this.binding.get('bindingId');
        var defConfig = {
            border: false,
            flex: 0,
            height: 600,
            bodyPadding: 10,
            layout: 'anchor',
            items: [{
                xtype: 'textfield',
                name: 'bindinglink',
                fieldLabel: 'Link to this binding<br>('+this.binding.get('signature')+
                                                   ', '+this.binding.get('library').libraryName+')',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                value: beginurl,
                size:50,
                anchor: '100%'
            },{
                xtype: 'textfield',
                name: 'booklink',
                fieldLabel: 'Link to this book<br>('+')',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                size:50,
                anchor: '100%'
            },{
                xtype: 'textfield',
                name: 'pagelink',
                fieldLabel: 'Link to this page',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                size:50,
                anchor: '100%'
            }]
        };
        Ext.apply(this, defConfig);
        
        // Watch for page changes and update fields accordingly.
        //TO DO: update booklink.
        this.viewer.getEventDispatcher().bind('pagechange', this,
        function()
        {
            var book=this.viewer.getBook();
            if (book===undefined)
                {
                    this.down('[name=booklink]').setValue('Not a book.');
                }
            else
                {
                    this.down('[name=booklink]').setValue(beginurl+'-'+book.get('firstPage'));
                }
            this.down('[name=pagelink]').setValue(beginurl+'-'+(this.viewer.pageNumber+1));
        });
        this.callParent();
    }
});

