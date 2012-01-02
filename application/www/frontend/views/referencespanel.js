
//Override basic Extjs functionality in order to enable changing labels
//during runtime.
Ext.override(Ext.form.Field, {setFieldLabel : function(label) 
        {
            if (this.rendered) Ext.get(this.labelEl.id).update(label);
            this.fieldLabel = label;
        }
});  

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
                name: 'bindingLink',
                fieldLabel: 'Link to this binding<br>('+this.binding.get('signature')+
                                                   ', '+this.binding.get('library').libraryName+')',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                value: beginurl,
                size:50,
                anchor: '100%'
            },{
                xtype: 'button',
                name: 'selectBinding',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                    {
                        this.up('referencespanel').select('bindingLink');
                    }
            },{
                xtype: 'textfield',
                name: 'bookLink',
                id: 'bookLink',
                fieldLabel: 'Link to this book<br>('+')',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                size:50,
                anchor: '100%'
            },{
                xtype: 'button',
                name: 'selectBook',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                    {
                        this.up('referencespanel').select('bookLink');
                    }
            },{
                xtype: 'textfield',
                name: 'pageLink',
                fieldLabel: 'Link to this page',
                labelAlign: 'top',
                readOnly : true,
                labelStyle: 'white-space:nowrap',
                size:50,
                anchor: '100%'
            },{
                xtype: 'button',
                name: 'selectPage',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                    {
                        this.up('referencespanel').select('pageLink');
                    }
            }]
        };
        Ext.apply(this, defConfig);
        
        // Watch for page changes and update fields accordingly.
        //TO DO: change label based on current book.
        this.viewer.getEventDispatcher().bind('pagechange', this,
        function()
        {
            var book=this.viewer.getBook();
            if (book===undefined)
                {
                    this.down('[name=bookLink]').setValue('Not a book.');
                    this.down('[name=bookLink]').setFieldLabel('Link to this book<br>(None)');
                }
            else
                {
                    this.down('[name=bookLink]').setValue(beginurl+'-'+book.get('firstPage'));
                    this.down('[name=bookLink]').setFieldLabel('Link to this book<br>('+book.get('title')+')');
                }
            this.down('[name=pageLink]').setValue(beginurl+'-'+(this.viewer.pageNumber+1));
        });
        this.callParent();
    },
    select: function(name)
        {
            this.down('[name='+name+']').selectText();
        }
});

