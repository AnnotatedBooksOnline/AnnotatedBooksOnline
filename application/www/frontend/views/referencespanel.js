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
        this.bindingModel = this.viewer.getBinding().getModel();
        
        this.urlPrefix = location.protocol + '//'
                       + location.hostname + location.pathname
                       +'#binding-' + this.bindingModel.get('bindingId');
        
        var _this = this;
        var defConfig = {
            border: false,
            bodyPadding: 10,
            layout: 'anchor',
            items: [{
                xtype: 'textfield',
                name: 'binding-link',
                labelAlign: 'top',
                readOnly: true,
                fieldLabel: '...',
                labelStyle: 'white-space: nowrap',
                size: 50,
                anchor: '100%'
            },{
                xtype: 'button',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                {
                    _this.select('binding-link');
                }
            },{
                xtype: 'textfield',
                name: 'book-link',
                labelAlign: 'top',
                readOnly: true,
                fieldLabel: '...',
                labelStyle: 'white-space: nowrap',
                size: 50,
                anchor: '100%'
            },{
                xtype: 'button',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                {
                    _this.select('book-link');
                }
            },{
                xtype: 'textfield',
                name: 'page-link',
                fieldLabel: 'Link to this page',
                labelAlign: 'top',
                readOnly: true,
                labelStyle: 'white-space: nowrap',
                size: 50,
                anchor: '100%'
            },{
                xtype: 'button',
                text: 'Select',
                style: 'margin-bottom: 5px',
                handler: function()
                {
                    _this.select('page-link');
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
        // Get binding model from viewer.
        var bindingModel = this.viewer.getBinding().getModel();
        
        // Calculate url prefix.
        var urlPrefix = location.protocol + '//'
                      + location.hostname + location.pathname
                      +'#binding-' + bindingModel.get('bindingId');
        
        // Set binding field label and value.
        var bindingLinkLabel = 'Link to this binding<br />(' +
            escape(bindingModel.get('library').libraryName) + ', ' +
            escape(bindingModel.get('signature')) + ')';
        
        this.down('[name=binding-link]').setFieldLabel(bindingLinkLabel);
        this.down('[name=binding-link]').setValue(this.urlPrefix);
        
        // Set book field label and value.
        var book = this.viewer.getBook();
        
        if (book === undefined)
        {
            this.down('[name=book-link]').setValue('Not a book.');
            this.down('[name=book-link]').setFieldLabel('Link to this book<br />(None)');
        }
        else
        {
            this.down('[name=book-link]').setValue(urlPrefix + '-' +
                book.get('firstPage'));
            this.down('[name=book-link]').setFieldLabel('Link to this book<br />(' +
                book.get('title') + ')');
        }
        
        // Set page field link.
        this.down('[name=page-link]').setValue(urlPrefix + '-' + (this.viewer.getPage() + 1));
    },
    
    select: function(name)
    {
        this.down('[name=' + name + ']').selectText();
    }
});
