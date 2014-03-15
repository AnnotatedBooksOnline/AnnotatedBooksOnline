
Ext.define('Ext.ux.StaticWindow', {
    extend: 'Ext.ux.WindowBase',
    alias: 'widget.staticwindow',
    
    initComponent: function() 
    {
        var defConfig = {
            layout: 'fit',
            width: this.width || 600,
            height: this.height || 400,
            items: [{
                xtype: 'staticpanel',
                file: this.file,
                content: this.content,
                bodyPadding: this.bodyPadding,
                border: 0
            }],
            bodyPadding: 0
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    }    
});

Ext.define('Ext.ux.YoutubeWindow', {
    extend: 'Ext.ux.StaticWindow',
    alias: 'widget.youtubewindow',
    
    initComponent: function() 
    {
        var args = {
            version: 3,        // API version 3
            modestbranding: 1, // Less Youtube branding
            theme: 'light',    // Light theme
            rel: 0,            // Do not show related videos when finished
            showinfo: 0,       // No title & uploader info before play
            fs: 1,             // Show full-screen button
            autohide: 1,       // Auto-hide controls when playing
            controls: 1,       // Show controls in player, load player immediately
            autoplay: 1,       // Immediately start playing,
            vq: 'hd720'        // Undocumented: loads video in HD quality
        };
        
        var defConfig = {
            content: '<iframe type="text/html" width="100%" height="100%" src="//www.youtube.com/embed/'
                     + this.video + '?' + Ext.Object.toQueryString(args) + '" frameborder="0"></iframe>',
            bodyPadding: 0,
            width: 854 + 20,
            height: 480 + 71,
            iconCls: 'video-icon'
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
    }
});

Ext.define('Ext.ux.StaticPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.staticpanel',

    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            bodyPadding: this.bodyPadding == undefined ? 5 : this.bodyPadding
        };
        
        if (this.content == undefined)
        {
            Ext.apply(defConfig, {
                loader: {
                    url: window.location.pathname + 'frontend/static/' + _this.file,
                    autoLoad: true,
                    loadMask: true,
                    failure: function()
                    {
                        _this.update("<h1>Oops!</h1><p>The information you requested could not be loaded.</p>");
                    },
                    params: {
                        timeout: 5000
                    }
                }
            });
        }
        else
        {
            Ext.apply(defConfig, {
                html: this.content
            });
        }
    
        Ext.apply(this, defConfig);
    
        this.callParent();
    }
});

