/*
 * A model base class that can on request automatically load its relations (i.e. hasMany) in a recursive way.
 */
 
Ext.define('Ext.ux.ModelBase', {
    extend: 'Ext.data.Model',
    
    inheritableStatics: {
        /*
         * Alternative to the static load() function on Ext.data.Model.
         * This one loads the Entities' relations recursively.
         */
        loadRecursive: function(id, config)
        {
            return this.load(id, {
                success: function(model)
                {
                    model.loadAssocs(config);
                },
                failure: config.failure,
                scope: config.scope
            });
        }
    },
    
    /*
     * A private helper function to load relations. There is no use using this directly.
     */
    loadAssocs: function(config)
    {
        var model    = this;
        var assocs   = model.associations.items;
        var toBeDone = assocs.length; // The number of callbacks we are expecting.
        var done     = 0;             // The number of successful callbacks.
        var failed   = false;         // Whether something has failed, and we should stop loading.
        
        // Maybe we have no associations, then succeed.
        if (!assocs.length && (config.success != undefined))
        {
            config.success.call(config.scope, model);
            
            return;
        }
        
        // Failure handler.
        var onFailure = function()
        {
            // Check if we have not yet failed already.
            if (!failed)
            {
                return;
            }
            
            // Call failure method.
            failed = true;
            if (config.failure !== undefined)
            {
                config.failure.call(config.scope, model);
            }
        };
        
        // Success handler.
        var onSuccess = function()
        {
            // One more done.
            ++done;
            
            // Check if we are done with everything.
            if ((done == toBeDone) && !failed && (config.success !== undefined))
            {
                config.success.call(config.scope, model);
            }
        }
        
        // For all related entities (i.e. hasMany)...
        for (var i = 0; i < assocs.length; i++)
        {
            // Load the associated (sub)store.
            var store = assocs[i].createStore().call(model);
            store.load({
                callback: function(records, operation, success)
                {
                    // Check for failure.
                    if (!success)
                    {
                        onFailure();
                        return;
                    }
                    
                    // The store was loaded successfully. Now, find relations of every store record.
                    store.each(function(record)
                    {
                        // Only Ext.ux.Model entities can be loaded recursively,
                        // as they have this function.
                        if (record.loadAssocs === undefined)
                        {
                            return;
                        }
                        
                        // We need an extra success.
                        ++toBeDone;
                        
                        // Recurse.
                        record.loadAssocs({
                            success: onSuccess,
                            failure: onFailure
                        });
                    });
                    
                    // We had success.
                    onSuccess();
                }
            });
        }
    }
});
