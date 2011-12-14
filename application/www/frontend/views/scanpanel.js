/*
 * Scan grid class.
 */
Ext.define('Ext.ux.UploadGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.uploadgrid',
    
    /*
     * Public methods.
     */
    
    // Gets event dispatcher.
    getEventDispatcher: function()
    {
        return this.eventDispatcher;
    },
    
    addUpload: function(id, filename, size, status, replaceIfSameFilename)
    {
        RequestManager.getInstance().request(
            'Upload',
            'fetchToken',
            {filename: filename, size: size},
            this,
            function(token)
            {
                this.addUploadWithToken(id, token, filename, size, status, replaceIfSameFilename);
            });
    },
    
    setStatus: function(id, status)
    {
        this.getUploadById(id).set('status', status);
    },
    
    setProgress: function(id, progress)
    {
        // Get progressbar component.
        var progressBar = Ext.getCmp(id);
        
        // Update progress bar.
        if (progressBar)
        {
            progressBar.updateProgress(progress / 100, '', true);
        }
        
        // Set progress for rendering progressbar.
        this.progressById[id] = progress / 100;
    },
    
    getUploads: function()
    {
        var uploads = [];
        this.store.data.each(
            function(record)
            {
                var id = record.get('id');
                
                uploads.push({
                    id:       id,
                    token:    record.get('token'),
                    filename: record.get('filename'),
                    status:   record.get('status'),
                    progress: this.progressById[id] || 0
                });
            },
            this
        );
        
        return uploads;
    },
    
    loadUploads: function(replaceIfSameFilename)
    {
        RequestManager.getInstance().request(
            'Upload',
            'fetchUploads',
            {},
            this,
            function(uploads)
            {
                for (var i = 0; i < uploads.length; ++i)
                {
                    var upload = uploads[i];
                    
                    var id = 'loaded-' + upload.token;
                    
                    this.addUploadWithToken(
                        id,
                        upload.token,
                        upload.filename,
                        upload.size,
                        upload.status,
                        replaceIfSameFilename
                    );
                    
                    if (upload.status == 'success')
                    {
                        this.setProgress(id, 100);
                    }
                }
            }
        );
    },
    
    removeAll: function()
    {
        // Trigger remove events.
        this.store.data.each(
            function(record)
            {
                this.eventDispatcher.trigger('remove', this, record.get('id'), record.get('token'));
            },
            this
        );
        
        // Remove all uploads.
        this.store.removeAll();
        
        // Trigger remove.
        this.eventDispatcher.trigger('clear', this);
    },
    
    /*
     * Private methods.
     */
    
    initComponent: function()
    {
        this.progressById = {};
        
        this.store = Ext.create('Ext.data.Store', {
            fields: ['id', 'token', 'filename', 'progressbar', 'status']
        });
        
        this.eventDispatcher = new EventDispatcher();
        
        var _this = this;
        var defConfig = {
            store: this.store,
            columns: [
                {header: 'Filename', dataIndex: 'filename', flex: 1},
                {header: 'Size', dataIndex: 'size', renderer: this.renderSize},
                {
                    header: 'Progress',
                    dataIndex: 'progressbar',
                    width: 150,
                    resizable: false,
                    sortable: false,
                    renderer: this.renderProgressBar
                },
                {header: 'Status', dataIndex: 'status', renderer: this.renderStatus},
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    items: [] // TODO: Add buttons.
                }
            ]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    renderSize: function(value)
    {
        if ((value === '') || (value === null) || (value === undefined))
        {
            return 'Unknown';
        }
        
        if (value > (1024 * 1024 * 1024))
        {
            return Math.round(value / (1024 * 1024 * 1024) * 10) / 10 + ' GiB';
        }
        else if (value > (1024 * 1024))
        {
            return Math.round(value / (1024 * 1024) * 10) / 10 + ' MiB';
        }
        else if (value > (1024))
        {
            return Math.round(value / 1024 * 10) / 10 + ' KiB';
        }
        else
        {
            return Math.round(value * 10) / 10 + ' B';
        }
    },
    
    renderProgressBar: function(value, metaData, record)
    {
        // Get component id.
        var id = record.get('id');
        
        // Render progressbar delayed.
        var _this = this;
        (function newScope(id)
            {
                setTimeout(function()
                    {
                        // Empty div as there may be an older progressbar.
                        $('#' + id).empty();
                        
                        // Get progress. Note that value does not contain this, it contains
                        // nothing as we do not want to couple the progress value to the progressbar
                        // immediately because that generates too many rerenders.
                        var progress = _this.progressById[id] || 0;
                        
                        try
                        {
                            new Ext.ProgressBar({
                                renderTo: id,
                                id: id,
                                value: progress,
                                animate: false
                            });
                        }
                        catch (e)
                        {
                            // Record might already have been removed/replaced.
                        }
                    }, 1);
            })(id);
        
        return '<div style="height: 20px;" id="' + id + '"></div>';
    },
    
    renderStatus: function(value)
    {
        switch (value)
        {
            case 'uploading': return 'Uploading';
            case 'error':     return 'Failed';
            case 'success':   return 'Succeeded';
            
            default:
               return 'Waiting';
        }
    },
    
    addUploadWithToken: function(id, token, filename, size, status, replaceIfSameFilename)
    {
        // Check for existing filename.
        if (replaceIfSameFilename !== false)
        {
            var existingModel = this.getUploadByFilename(filename);
            if (existingModel !== null)
            {
                // Remove model from store and remove progress.
                var existingId    = existingModel.get('id');
                var existingToken = existingModel.get('token');
                
                this.store.remove(existingModel);
                delete this.progressById[id];
                
                // Trigger remove.
                this.eventDispatcher.trigger('remove', this, existingId, existingToken);
            }
        }
        
        // Add new upload.
        this.store.add({
            id: id,
            token: token,
            filename: filename,
            size: size,
            status: status
        });
        
        // Trigger add.
        this.eventDispatcher.trigger('add', this, id, token, filename, size);
    },
    
    getUploadById: function(id)
    {
        return this.store.findRecord('id', id, 0, false, false, true);
    },
    
    getUploadByFilename: function(filename)
    {
        return this.store.findRecord('filename', filename, 0, false, true, true);
    }
});

/*
 * Scan panel class.
 */
Ext.define('Ext.ux.ScanPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.scanpanel',
    
    /*
     * Public methods.
     */
    
    getValues: function()
    {
        var values = this.grid.getUploads();
        
        // Remove ids, they do not make sense outside the upload grid.
        for (var i = values.length - 1; i >= 0; --i)
        {
            delete values[i].id;
        }
        
        return values;
    },
    
    reset: function()
    {
        return this.grid.removeAll();
    },
    
    /*
     * Private methods.
     */
    
    initComponent: function()
    {
        this.uploadDivId = Ext.id();
        
        var _this = this;
        var defConfig = {
            border: false,
            items: [{
                title: 'Scans',
                xtype: 'uploadgrid',
                height: 200,
                margin: '0 0 10 0'
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'end'
                },
                items: [{
                    xtype: 'button',
                    text: 'Clear scans',
                    width: 100,
                    handler: function()
                    {
                        _this.grid.removeAll();
                    }
                },{
                    xtype: 'container',
                    html: '<div style="margin-left: 10px;"><div id="' +
                          this.uploadDivId + '"></div></div>',
                    height: 30
                }]
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },

    afterRender: function()
    {
        this.callParent();
        
        // Get upload grid.
        this.grid = this.down('uploadgrid');
        
        // Listen for actions on grid.
        this.grid.getEventDispatcher().bind('add', this, this.onUploadAdded);
        this.grid.getEventDispatcher().bind('remove', this, this.onUploadRemoved);
        this.grid.getEventDispatcher().bind('clear', this, this.onUploadsCleared);
        
        // Load uploads.
        this.grid.loadUploads();
        
        // Get all cookies.
        var cookies = getCookies();
        
        // Set cookies as post parameters.
        var postParams = {};
        for (var i = cookies.length - 1; i >= 0; --i)
        {
            postParams[cookies[i].name] = cookies[i].value;
        }
        
        // Create SWF upload instance.
        var _this = this;
        this.swfUpload = new SWFUpload({
            // Urls.
            upload_url: '?controller=Upload&action=upload', // Must be relative to swfupload.swf!
            flash_url: 'frontend/external/swfupload.swf',
            
            // Post parameters.
            post_params: postParams,
            
            // Button configuration.
            button_image_url: 'frontend/resources/images/uploadbutton.png',
            button_placeholder_id: this.uploadDivId,
            button_width: 100,
            button_height: 22,
            button_cursor: SWFUpload.CURSOR.HAND,
            
            // File description.
            file_post_name: 'file',
            file_types: "*.jpg;*.jpeg;*.tif;*.tiff",
            file_types_description: 'Images',
            
            // Event handlers.
            file_queued_handler: function(file)
                {
                    _this.onFileQueued(file.id, file.name, file.size);
                },
            file_queue_error_handler: function(file, code, message)
                {
                    // NOTE: Just omit error?
                },
            upload_start_handler: function(file)
                {
                    _this.onFileUploadStart(file.id);
                },
            upload_complete_handler: function(file)
                {
                    _this.onFileUploadEnd(file.id);
                },
            upload_progress_handler: function(file, complete, total)
                {
                    _this.onFileProgress(file.id, (complete / total) * 100);
                },
            upload_error_handler: function(file, code, message)
                {
                    _this.onFileUploadError(file.id, code, message);
                },
            upload_success_handler: function(file)
                {
                    _this.onFileUploadSuccess(file.id);
                }
        });
    },
    
    onFileQueued: function(id, filename, size)
    {
        this.grid.addUpload(id, filename, size, 'waiting');
    },
    
    onFileUploadStart: function(id)
    {
        this.grid.setStatus(id, 'uploading');
    },
    
    onFileUploadEnd: function(id)
    {
        this.swfUpload.startUpload();
    },
    
    onFileProgress: function(id, progress)
    {
        this.grid.setProgress(id, progress);
    },
    
    onFileUploadSuccess: function(id)
    {
        this.grid.setProgress(id, 100);
        this.grid.setStatus(id, 'success');
    },
    
    onFileUploadError: function(id, code, message)
    {
        this.grid.setStatus(id, 'error');
    },
    
    onUploadAdded: function(event, grid, id, token)
    {
        // Skip loaded uploads.
        if (id.substr(0, 7) == 'loaded-')
        {
            return;
        }
        
        this.swfUpload.addFileParam(id, 'token', token);
        this.swfUpload.startUpload(id);
    },
    
    onUploadRemoved: function(event, grid, id, token)
    {
        // Remove upload serverside.
        RequestManager.getInstance().request(
            'Upload',
            'delete',
            {token: token}
        );
        
        // Skip loaded uploads.
        if (id.substr(0, 7) == 'loaded-')
        {
            return;
        }
        
        // Cancel upload.
        this.swfUpload.cancelUpload(id, false);
    },
    
    onUploadsCleared: function(event, grid)
    {
        // Current uploads have already been cancelled by onUploadRemoved handler.
    }
});
