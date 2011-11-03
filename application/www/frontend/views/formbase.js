/*
 * Form base class.
 */

Ext.define('Ext.ux.FormBase', {
    extend: 'Ext.form.Panel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            bodyPadding: 10,
            bodyBorder: true,
            
            trackResetOnLoad: true,
            
            defaultType: 'textfield',
            
            defaults: {
                anchor: '100%'
            },
            
            fieldDefaults: {
                allowBlank: false
            }
        };
        
        Ext.apply(this, defConfig);
        
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
    
    updateModel: function()
    {
        // Set all form values that are also defined
        // in the model.
        var values = this.getForm().getValues();
        for (var name in this.model.fields)
        {
            if (values[name] !== undefined)
            {
                this.model.set(name, values[name]);
            }
        }
    },
    
    saveModel: function(obj, onSuccess)
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
            }
        });
    }
});
