/*
 * Ext JS Proxy for the Request manager.
 *
 * Request controller must be a proxy setting.
 * Request action is determined according to operation action: read, create, update, destroy.
 * 
 * Requests contain these fields:
 * - id: The id of the model to fetch.
 * - page: The current page number.
 * - start: The start row index.
 * - limit: The number of rows to be returned.
 * - filters: The Ext.util.Filter[] to apply.
 * - groupers: The Ext.util.Group[] to apply.
 * - sorters: The Ext.util.Sorter[] to apply.
 * - records: The records (Ext.data.Model[]) to process.
 * 
 * Response should contain these fields:
 * - records: The returned data fields.
 * - total: The total number of fields in the query (for paging).
 * - success: Whether or not the request succeeded (regarding the data, not the server or connection).
 */

Ext.define('Ext.ux.RequestManagerProxy', {
    extend: 'Ext.data.ServerProxy',
    alias: 'proxy.requestmanager',
    
    // Controller to use for the action.
    controller: undefined,
    
    // Use the JSON reader to convert response.
    reader: {
        type: 'json',
        root: 'records'
    },
    
    // Constructs the proxy.
    constructor: function(config)
    {
        this.addEvents('exception');
        
        config = config || {};
        this.callParent([config]);
    },
    
    // The four possible actions.
    create: function()
    {
        return this.doRequest.apply(this, arguments);
    },

    read: function()
    {
        return this.doRequest.apply(this, arguments);
    },

    update: function()
    {
        return this.doRequest.apply(this, arguments);
    },

    destroy: function()
    {
        return this.doRequest.apply(this, arguments);
    },
    
    // Builds the request.
    buildRequest: function(operation, scope)
    {
        // Fetch operation parameters.
        var params = Ext.applyIf(operation.params || {}),
            request;

        // Apply our parameters.
        params = Ext.applyIf(params, this.getParams(operation));

        // Add Ext JS compliant request.
        request = Ext.create('Ext.data.Request', {
            params:    params,
            action:    operation.action,
            records:   operation.records,
            operation: operation,
            scope:     scope
        });
        
        // Write record to jsonData.
        var writer = this.getWriter();
        if (operation.allowWrite())
        {
            request = writer.write(request);
            if (request.jsonData !== undefined)
            {
                params.record = request.jsonData;
            }
        }
        
        // Determine action to use.
        switch (operation.action)
        {
            case 'read':    request.action = 'load';   break;
            case 'update':  request.action = 'save';   break;
            case 'create':  request.action = 'create'; break;
            case 'destroy': request.action = 'delete'; break;
            default:        request.action = 'load';   break;
        }
        
        // Add request to operation.
        operation.request = request;
        
        return request;
    },
    
    // Executes the actual request.
    doRequest: function(operation, callback, scope)
    {
        var _this = this;
        function onSuccess(data)
        {
            // Set missing return data if not set.
            // These are not required by some actions.
            if (!data)
            {
                data = {success: true, records: []};
            }
            else if (!data.records)
            {
                data.records = [];
            }
            
            _this.processResponse(true, operation, request, data, callback, scope);
        }
        
        function onError(code, message, trace)
        {
            // TODO: Remove this, we may want to capture errors later on.
            RequestManager.showErrorMessage(code, message, trace);
            
            var data = {code: code, message: message, trace: trace};
            
            _this.processResponse(false, operation, request, data, callback, scope);
        }
        
        // Build request.
        var request = this.buildRequest(operation, scope);
        
        // Send request.
        RequestManager.getInstance().request(
            this.controller,
            request.action,
            request.params,
            scope,
            onSuccess,
            onError
        );

        return request;
    },
    
    // Sets operation exception according to response.
    setException: function(operation, response)
    {
        operation.setException({
            status:     response.code,
            statusText: response.message
        });
    },
    
    // Parameter building.
    getParams: function(operation)
    {
        var params   = {},
            isDef    = Ext.isDefined,
            id       = operation.id,
            //groupers = operation.groupers,
            sorters  = operation.sorters,
            filters  = operation.filters,
            page     = operation.page,
            start    = operation.start,
            limit    = operation.limit;

        if (isDef(page))
        {
            params.page = page;
        }

        if (isDef(start))
        {
            params.offset = start;
        }

        if (isDef(limit))
        {
            params.limit = limit;
        }

        // NOTE: Groupers or group? operation seems to have just a group.
        // NOTE: Anyway, do we want to support this serverside?
        /*
        if (groupers && (groupers.length > 0))
        {
            params.groupers = this.encodeSorters(groupers);
        }
        */

        if (sorters && (sorters.length > 0))
        {
            params.sorters = this.encodeSorters(sorters);
        }

        if (filters && (filters.length > 0))
        {
            params.filters = this.encodeFilters(filters);
        }

        // NOTE: Should we apply this as a filter?
        // NOTE: Because a select on a primary key is way faster than: .. WHERE id LIKE '%10%' ..
        if (id)
        {
            params.id = operation.id;
        }
        
        return params;
    },
    
    encodeSorters: function(sorters)
    {
        var arr    = [],
            length = sorters.length,
            i      = 0;

        for (; i < length; i++)
        {
            arr[i] = {
                column:    sorters[i].property,
                direction: sorters[i].direction
            };
        }
        
        return arr;
    },
    
    encodeFilters: function(filters)
    {
        var arr    = [],
            length = filters.length,
            i      = 0;

        for (; i < length; i++)
        {
            arr[i] = {
                column: filters[i].property,
                value:  filters[i].value
            };
        }
        return arr;
    },
    
    // Destroys reader and writer.
    onDestroy: function()
    {
        Ext.destroy(this.reader, this.writer);
    }
});
