/*
 * Scan grid class.
 */
Ext.define('Ext.ux.UploadGrid', {
    extend: 'Ext.panel.Panel',
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
        if (status == 'success')
        {
            this.setProgress(id, 100);
        }
        
        var record = this.getUploadById(id);
        record.set('status', status);
        record.save();
    },
    
    setProgress: function(id, progress)
    {
        // Do not go back in progress.
        if ((progress > 0) && (progress <= this.progressById[id]))
        {
            return;
        }
        
        this.progressById[id] = progress;
        
        var record = this.getUploadById(id);
        if (record)
        {
            record.set('progress', progress);
            record.save();
        }
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
                    
                    if (upload.status == 'success')
                    {
                        this.setProgress(id, 100);
                    }
                    
                    this.addUploadWithToken(
                        id,
                        upload.token,
                        upload.filename,
                        upload.size,
                        upload.status,
                        replaceIfSameFilename
                    );
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
    
    remove: function(id)
    {
        // Fetch model.
        var model = this.getUploadById(id);
        if (model !== null)
        {
            // Remove model from store and remove progress.
            var existingId    = model.get('id');
            var existingToken = model.get('token');
            
            this.store.remove(model);
            delete this.progressById[id];
            
            // Trigger remove.
            this.eventDispatcher.trigger('remove', this, existingId, existingToken);
        }
    },
    
    /*
     * Private methods.
     */
    
    initComponent: function()
    {
        this.progressById = {};
        
        var _this = this;
        
        this.store = Ext.create('Ext.data.Store', {
            fields: ['id', 'token', 'filename', 'progress', 'status', 'size']
        });
        
        this.eventDispatcher = new EventDispatcher();
        
        var onCancel = function(id)
        {
            _this.remove(id);
        }
        
        this.listeners = {
            afterrender: function()
            {
                _this.store.on({
                    add: function(store, records)
                    {
                        for (var i = 0; i < records.length; i++)
                        {
                            var record = records[i];
                            var progress = new UploadProgress(
                                _this.body.dom, record.get('id'),
                                record.get('filename'),
                                _this.renderSize(record.get('size')),
                                onCancel
                            );
                            progress.setStatus(_this.renderStatus(record.get('status')));
                            progress.setProgress(record.get('progress'));
                        }
                    },
                    update: function(store, record)
                    {
                        var progress = new UploadProgress(_this.body.dom, record.get('id'));
                        progress.setStatus(_this.renderStatus(record.get('status')));
                        progress.setProgress(record.get('progress'));
                    },
                    remove: function(store, record)
                    {
                        var progress = new UploadProgress(_this.body.dom, record.get('id'));
                        progress.destroy();
                    },
                    clear: function()
                    {
                        if (_this.body.dom.childNodes.length > 0)
                        {
                            _this.body.dom.removeChild(_this.body.dom.childNodes[0]);
                        }
                    }
                });
            }
        };
        this.autoScroll = true;
        
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
            status: status,
            progress: status === 'success' ? 100 : 0
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
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            height: 240,
            items: [{
                title: 'Scans',
                xtype: 'uploadgrid',
                height: 200,
                margin: '0 0 6 0'
            },{
                xtype: 'container',
                layout: {
                    type: 'column'
                },
                items: [{
                    columnWidth: this.showExistingBindingMessage ? .6 : 0,
                    xtype: 'label',
                    text: this.showExistingBindingMessage ? 'Existing scans for this binding are not shown' : ' '
                },{
                    xtype: 'container',
                    columnWidth: this.showExistingBindingMessage ? .4 : 1,
                    layout: {
                        align: 'right',
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
                        width: 110,
                        html: '<div style="margin-left: 10px;"><div id="' +
                              this.uploadDivId + '"></div></div>',
                              height: 30
                    }]
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
            button_window_mode: SWFUpload.WINDOW_MODE.OPAQUE,
            
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
                    //Show no error.
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
            upload_success_handler: function(file, data, receivedResponse)
                {
                    _this.onFileUploadSuccess(file.id, data, receivedResponse);
                }
        });
        
        // Check if we have at least Flash 9 support.
        if (!FlashDetect.versionAtLeast(9))
        {
            MessageBar.show('You need to have Adobe Flash installed to be able to upload scans.', 10000);
        }
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
    
    onFileUploadSuccess: function(id, data, receivedResponse)
    {
        if (receivedResponse && (data === 'success'))
        {
            this.grid.setStatus(id, 'success');
        }
        else
        {
            this.grid.setStatus(id, 'error');
        }
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
