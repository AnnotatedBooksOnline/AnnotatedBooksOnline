/*
 * Help panel class.
 */

Ext.define('Ext.ux.HelpPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.helppanel',
    
    initComponent: function()
    {
        var _this = this;
    
        var treestore = Ext.create('Ext.data.TreeStore', {
            model: 'Ext.ux.HelpModel',
            root: {helpId: 'root'}
        });
        
        var defConfig = {
            layout: 'border',
            items: [{
                xtype: 'treepanel',
                title: 'Index',
                width: 200,
                region: 'west',
                cls: 'help-tree',
                store: treestore,
                columns: [{xtype: 'treecolumn', text: 'Name', dataIndex: 'pageName'}],
                collapsible: true,
                rootVisible: false,
                hideHeaders: true,
                viewConfig: {
                    loadMask: false
                },
                listeners: {
                    itemclick: function(t, record, item, index, e, eOpts)
                    {
                        _this.updateHTML(record);
                    }
                }
            },{
                xtype: 'panel',
                region: 'center',
                autoScroll: true,
                name: 'helptext',
                id: 'helpmain',
                styleHtmlContent: true,
                styleHtmlCls: 'help'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('modelchange', this, this.onAuthenticationChange);
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.getComponent(0).expandPath('/root', undefined, undefined, function(succes, lastNode)
        {
            var helppage = lastNode.findChild('pageName',this.helpTab);
            if (helppage === null)
            {
                helppage = lastNode.findChild('pageName', 'default');
            }
            
            if (helppage)
            {
                this.updateHTML(helppage);
            }
        },this);
    },
    
    updateHTML: function(record)
    {
        var _this = this;
        var page = record;
        
        record.expand(true, function()
        {
            while (page.get('helpId').substring(2) != '-1')
            {
                page = page.parentNode;
            }
            
            var htmltext = _this.generateHelpHTML(page, 2);
            _this.getComponent(1).update(htmltext);
            
            var content = Ext.get(record.get('pageName'));
            var height = content.getOffsetsTo(Ext.get('helpmain-body'));
            
            _this.getComponent(1).body.scroll('b', height[1], false);
        });
    },
    
    generateHelpHTML: function(record, dept)
    {
        var name = record.get('pageName');
        var htmltext = '<h' + dept + ' id="'+ name +'">' + name + '</h' + dept + '>';
        if (dept > 2)
        {
            htmltext += '<p>' + record.get('content') + '</p>';
        }
        
        for (var i = 0; i < record.childNodes.length; ++i)
        {
            htmltext += this.generateHelpHTML(record.childNodes[i], dept + 1);
        }
        
        htmltext = htmltext.replace(
            /[*][*]([^*]+)[|][|]([/0-9,-]+)[*][*]/g,
            '<a style="cursor: pointer" onclick="Ext.getCmp(\''
                + this.getId() + '\').processLink(\'$2\')">$1</a>'
        );
        
        return htmltext;
    },
    
    processLink: function(path)
    {
        this.getComponent(0).collapseAll();
        this.getComponent(0).expandPath('/root' + path, undefined, undefined, function(succes, lastNode)
        {
            this.updateHTML(lastNode);
        },this);
    },
    
    onAuthenticationChange: function()
    {
        // TODO: Needed?
    }
});
