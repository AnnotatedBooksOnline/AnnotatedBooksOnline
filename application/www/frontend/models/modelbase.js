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
        var model = this;
        var assocs = model.associations.items;
        var num = assocs.length; // The number of callbacks we are expecting.
        var done = 0;            // The number of successful callbacks.
        var failed = false;      // Whether something has failed, and we should stop loading.
        // For all related Entities (i.e. hasMany)...
        for (var i = 0; i < assocs.length; i++)
        {
            // Load the associated (sub)store
            var store = assocs[i].createStore().call(model);
            store.load({
                callback: function(records, operation, success)
                {
                    if (success)
                    {
                        // The store was loaded successfully. Now, find relations of every store record.
                        done++;
                        store.each(function(record)
                        {
                            num++;
                            // Only Ext.ux.Model Entities can be loaded recursively, as they have this function.
                            if (record.loadAssocs != undefined)
                            {
                                // Recurse.
                                record.loadAssocs({
                                    success: function()
                                    {
                                        done++;
                                        if (done == num && !failed && config.success != undefined)
                                        {
                                            config.success.call(config.scope, model);
                                        }
                                    }, 
                                    failure: function()
                                    {
                                        if (!failed)
                                        {
                                            failed = true;
                                            if (config.failure != undefined)
                                            {
                                                config.failure.call(config.scope, model);
                                            }
                                        }
                                    },
                                    scope: config.scope
                                });
                            }
                        });
                        // Seems like we are done here: the store might not have had records at all.
                        if (done == num && !failed && config.success != undefined)
                        {
                            config.success.call(config.scope, model);
                        }
                    }
                    else
                    {
                        // Something went wrong while loading the store.
                        if (!failed)
                        {
                            failed = true;
                            if (config.failure != undefined)
                            {
                                config.failure.call(config.scope, model);
                            }
                        }
                    }
                },
                scope: config.scope
            });
        }
        // Maybe we had no associations, then succeed.
        if (assocs.length == 0 && config.success != undefined)
        {
            config.success.call(config.scope, model);
        }
    }
});

