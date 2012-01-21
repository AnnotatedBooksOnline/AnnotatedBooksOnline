/*
 * Form base class.
 */

 //@selectFirst: Determines whether the cursor should appear in the first field or not.
 
Ext.define('Ext.ux.FormBase', {
    extend: 'Ext.form.Panel',
    selectFirst: true,
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            bodyPadding: 10,
            bodyBorder: true,
            trackResetOnLoad: true,
            
            defaultType: 'textfield',
            
            defaults: {
                anchor: '100%',
                
                // Enable enter to submit form.
                enableKeyEvents: true,
                listeners: {
                    specialKey: function(field, event)
                    {
                        if (event.getKey() == Ext.EventObject.ENTER)
                        {
                            _this.submit();
                        }
                    }
                }
            },
            
            fieldDefaults: {
                allowBlank: false,
                labelWidth: 120
            }
        };
        
        Ext.apply(this, defConfig);
        
        // Add submit button.
        if (!this.buttons)
        {
            this.buttons = [{
                xtype: 'button',
                formBind: true,
                disabled: true,
                text: this.submitButtonText,
                width: 140,
                handler: function()
                {
                    _this.submit();
                }
            }];
        }
        
        // Create loading and saving masks.
        this.loadingMask = new Ext.LoadMask(this, {msg: 'Loading...'});
        this.savingMask  = new Ext.LoadMask(this, {msg: 'Saving...'});
        
        // Fix bug with disabled button in ExtJS.
        this.on('afterrender', function(me)
            {
                delete me.form._boundItems;
            });
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        // Set model if given.
        if (this.model)
        {
            this.setModel(this.model, this.modelId);
        }
        
        // Focus first field.
        if (this.selectFirstField !== false)
        {
            var field = this.getForm().getFields().getAt(0);
            if (field !== undefined)
            {
                setTimeout(function() { field.focus(true, true); }, 10);
            }
        }
    },
    
    setModel: function(model, id)
    {
        // Check if need to load an instance ourselves.
        if (id !== undefined)
        {
            // Show loading mask.
            this.loadingMask.show();
            
            // Model is a class, and we have to load an instance.
            var _this = this;
            model.load(id, {
                success: function(model)
                {
                    // Set model.
                    _this.model = model;
                    _this.loadRecord(model);
                    
                    // Hide loading mask.
                    _this.loadingMask.hide();
                },
                failure: function()
                {
                    // Hide loading mask.
                    _this.loadingMask.hide();
                    
                    // Disable form.
                    _this.disable();
                }
            });
        }
        else
        {
            // Model is an instance of a model.
            this.model = model;
            this.loadRecord(model);
        }
    },
    
    getModel: function()
    {
        return this.model;
    },
    
    updateModel: function()
    {
        // Set all form values that are also defined
        // in the model.
        var values = this.getForm().getValues();
        
        for (var i = this.model.fields.items.length - 1; i >= 0; --i)
        {
            var fieldName = this.model.fields.items[i].name;
            
            if (values[fieldName] !== undefined)
            {
                this.model.set(fieldName, values[fieldName]);
            }
        }
    },
    
    saveModel: function(obj, onSuccess, onError)
    {
        // Show saving mask.
        this.savingMask.show();
        
        // Update model its values.
        this.updateModel();
        
        // Save model.
        var _this = this;
        this.model.save({
            success: function()
            {
                // Hide saving mask.
                _this.savingMask.hide();
                
                // Call success callback.
                if (onSuccess !== undefined)
                {
                    onSuccess.call(obj);
                }
            },
            failure: function()
            {
                // Hide saving mask.
                _this.savingMask.hide();
                
                // Call error callback.
                if (onError !== undefined)
                {
                    onError.call(obj);
                }
            }
        });
    },
    
    submit: function()
    {
        // Implement in subclass.
    },
    
    reset: function()
    {
        // Reset the form.
        this.getForm().reset(); 
    }
});
