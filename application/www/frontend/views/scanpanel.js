/*
 * Scan grid class.
 */
Ext.define('Ext.ux.ScanGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.scangrid',
    
    initComponent: function()
    {
        this.progressById = {};
        
        this.store = Ext.create('Ext.data.Store', {
            fields: ['id', 'filename', 'progressbar', 'status']
        });
        
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
                        
                        // Get progress. Note that value does not contain this, it contains nothing
                        // as we do not want to couple the progress value to the progressbar immediately
                        // because that generates too many rerenders.
                        var progress = _this.progressById[id] || 0;
                        
                        new Ext.ProgressBar({
                            renderTo: id,
                            id: id,
                            value: progress,
                            animate: false
                        });
                    }, 1);
            })(id);
        
        return '<div style="height: 20px;" id="' + id + '"></div>';
    },
    
    renderStatus: function(value)
    {
        switch (value)
        {
            case 'uploading': return 'Uploading';
            case 'failed':    return 'Failed';
            case 'succeeded': return 'Succeeded';
            
            default:
               return 'Waiting';
        }
    },
    
    addScan: function(id, filename, size, status, replaceIfSameFilename)
    {
        if (replaceIfSameFilename !== false)
        {
            var existingModel = this.getFileByFilename(filename);
            if (existingModel !== null)
            {
                // Remove model from store and remove progress.
                this.store.remove(existingModel);
                delete this.progressById[existingModel.get('id')];
                
                // TODO: Notify remove.
            }
        }
        
        this.store.add({id: id, filename: filename, size: size, status: status});
        
        // TODO: Notify add.
    },
    
    setStatus: function(id, status)
    {
        this.getFileById(id).set('status', status);
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
    
    getFileById: function(id)
    {
        return this.store.findRecord('id', id, 0, false, false, true);
    },
    
    getFileByFilename: function(filename)
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
    
    initComponent: function()
    {
        this.uploadDivId = Ext.id();
        
        var defConfig = {
            border: false,
            items: [{
                title: 'Scans',
                xtype: 'scangrid',
                height: 200,
                margin: '0 0 10 0'
            },{
                xtype: 'container',
                html: '<div style="float: right;"><div id="' + this.uploadDivId + '"></div></div>',
                height: 30
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },

    afterRender: function()
    {
        this.callParent();
        
        // Get data grid.
        this.grid = this.down('scangrid');
        
        // Listen for actions on grid.
        //..
        
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
            button_width: 56,
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
        this.grid.addScan(id, filename, size, 'waiting');
        
        this.swfUpload.startUpload(id);
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
        this.grid.setStatus(id, 'succeeded');
    },
    
    onFileUploadError: function(id, code, message)
    {
        this.grid.setStatus(id, 'failed');
    },
    
    onFileRemoved: function(id)
    {
        this.swfUpload.cancelUpload(id, false);
    }
});
