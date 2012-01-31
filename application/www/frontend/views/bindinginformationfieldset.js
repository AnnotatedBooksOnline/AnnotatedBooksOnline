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
        

        Ext.ux.BindingModel.loadRecursive(this.bindingId, 
        {
              scope: _this,
              failure: function(binding, operation) {
                   //handleError
                   return undefined;
              },
              success: function(binding, operation) {
                   //load the names of the readers
                   var readerNames='';
                   binding.provenances().each(function(record)
                   {
                       readerNames+=','+record.get('name');
                   });
                        
                   //load the names of the languages associated with the binding
                   var bindingLanguages='';
                   binding.bindingLanguages().each(function(record)
                   {
                        bindingLanguages+=','+record.get('languageName');
                   });
                   
                    if(readerNames === '')
                    {
                        readerNames = ' Unknown reader(s)';
                    }
                    
                    if(bindingLanguages === '')
                    {
                        bindingLanguages = ' No language(s)';
                    }
                         
                   this.down('propertygrid').setSource({
                              "a": binding.get('library').libraryName,
                              "b": binding.get('signature'),
                              "c": readerNames.substring(1),
                              "d": bindingLanguages.substring(1)
                         });
               },
               callback: function(record, operation) {}
        });
        

        
        var store = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.BindingModel'
        });
        
        var defConfig = {
            flex: 1,
            items: [{
                xtype: 'propertygrid',
                propertyNames: {
                    a: 'Library',
                    b: 'Shelfmark',
                    c: 'Readers',
                    d: 'Languages of annotations'
                },
                source: {},
                listeners: {
                    // Prevent editing
                    beforeedit: function() {
                        return false;
                    }
                },
                style: 'margin-top: 5px; margin-bottom: 5px',
                hideHeaders: true,
                nameColumnWidth: 200
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }
});

