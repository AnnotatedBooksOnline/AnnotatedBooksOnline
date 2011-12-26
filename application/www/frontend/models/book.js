/*
 * A model base class that can on request automatically load its (hasMany) relations in a recursive way.
 */
 
Ext.define('Ext.ux.Model', {
    extend: 'Ext.data.Model',
    inheritableStatics: {
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
    loadAssocs: function(config)
    {
        var model = this;
        var assocs = model.associations.items;
        var num = assocs.length;
        var done = 0;
        var failed = false;
        for (var i = 0; i < assocs.length; i++)
        {
            var store = assocs[i].createStore().call(model);
            store.load({
                callback: function(records, operation, success)
                {
                    if (success)
                    {
                        done++;
                        store.each(function(record)
                        {
                            num++;
                            if (record.loadAssocs != undefined)
                            {
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
                        if (done == num && !failed && config.success != undefined)
                        {
                            config.success.call(config.scope, model);
                        }
                    }
                    else
                    {
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
        if (assocs.length == 0 && config.success != undefined)
        {
            config.success.call(config.scope, model);
        }
    }
});


/*
 * Annotation model.
 */

Ext.define('Ext.ux.AnnotationModel', {
    extend: 'Ext.ux.Model',
    idProperty: 'annotationId',
    fields: ['annotationId', 'scanId'],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Annotation',
        model: 'Ext.ux.AnnotationModel'
    }
});

/*
 * Scan model.
 */

Ext.define('Ext.ux.ScanModel', {
    extend: 'Ext.ux.Model',
    idProperty: 'scanId',
    fields: ['scanId', 'bindingId', 'pageNumber', 'status', 'width', 'height', 'zoomLevel', 'uploadId'],

    hasMany: {
        model: 'Ext.ux.AnnotationModel',
        name: 'annotations',
        filterProperty: 'scanId'
    },
    
    proxy: {
        type: 'requestmanager',
        controller: 'Scan',
        model: 'Ext.ux.ScanModel'
    }
});

/*
 * Book model.
 */

Ext.define('Ext.ux.BookModel', {
    extend: 'Ext.ux.Model',
    idProperty: 'bookId',
    fields: ['bookId', 'bindingId', 'title', 'minYear', 'maxYear', 'author', 'languages', 'publisher', 'placePublished'],

    proxy: {
        type: 'requestmanager',
        controller: 'Book',
        model: 'Ext.ux.BookModel'
    },
    
    getTimePeriod: function()
    {
        if (this.get('minYear') == this.get('maxYear'))
        {
            return this.get('minYear');
        }
        return this.get('minYear') + ' - ' + this.get('maxYear');
    }
});

/*
 * Binding model.
 */

Ext.define('Ext.ux.BindingModel', {
    extend: 'Ext.ux.Model',
    idProperty: 'bindingId',
    fields: ['bindingId', 'library', 'signature', 'provenance', 'languagesOfAnnotations'],

    hasMany: [{
        model: 'Ext.ux.BookModel',
        name: 'books',
        filterProperty: 'bindingId'
    },{
        model: 'Ext.ux.ScanModel',
        name: 'scans',
        filterProperty: 'bindingId'
    }],
    
    proxy: {
        type: 'requestmanager',
        controller: 'Binding',
        model: 'Ext.ux.BindingModel'
    }
});

