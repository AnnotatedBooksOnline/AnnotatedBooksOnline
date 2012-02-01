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
            root: {
                helpId: 'root',
                pageName: 'root'
            }
        });
        
        var defConfig = {
            layout: 'border',
            items: [{
                xtype: 'treepanel',
                title: 'Index',
                width: 200,
                selModel: Ext.create('Ext.selection.TreeModel', {
                    enableKeyNav: false
                }),
                region: 'west',
                name: 'helpindex',
                id: 'helptree',
                cls: 'help-tree',
                store: treestore,
                columns: [{xtype: 'treecolumn', text: 'Name', dataIndex: 'pageName', flex: 1}],
                collapsible: true,
                rootVisible: false,
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
    
    destroy: function()
    {
        // Unsubscribe from authentication changes.
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.unbind('modelchange', this, this.onAuthenticationChange);
        
        this.callParent();
    },
    
    //UpdateTab is called from the applicationviewport by gotoTabUnique
    updateTab: function(data, scope)
    {
        scope.down('[name=helpindex]').collapseAll();
        
        scope.getHelpType(data[0]);
    },
    
    //Find the correct helpPage corresponding to the type
    getHelpType: function(type)
    {
        switch (type)
        {
            case 'uploadinfo':
            case 'reorderscan':
            case 'selectbook':
                type = 'upload';
        }
    
        this.down('[name=helpindex]').expandPath('/root', undefined, undefined, function(succes, lastNode)
        {
            var helppage = lastNode.findChild('helpType',type);
            if (helppage === null)
            {
                helppage = lastNode.findChild('helpType', 'welcome');
            }
            
            if (helppage !== null)
            {
                this.updateHTML(helppage);
            }
        },this);
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.getHelpType(this.helpType);
    },
    
    updateHTML: function(record)
    {
        var _this = this;
        var page = record;
        
        this.path = record.getPath();
        
        while (page.parentNode.get('pageName') != 'root')
        {
            page = page.parentNode;
        }
        
        page.expand(true, function()
        {
            var htmltext = _this.generateHelpHTML(page, 1);
            _this.down('[name=helptext]').update(htmltext);
            
            //Scroll to the paragraph
            var content = Ext.get(record.get('pageName'));
            var height = content.getOffsetsTo(Ext.get('helpmain-body'));
            _this.down('[name=helptext]').body.scroll('b', height[1], false);
        });
    },
    
    //Recursively create html from the helpModels
    generateHelpHTML: function(record, depth)
    {
        var name = record.get('pageName');
        var htmltext = '<h' + depth + ' id="'+ name +'">' + name + '</h' + depth + '>';
        if (depth > 1)
        {
            htmltext += '<p>' + record.get('content') + '</p>';
        }
        
        for (var i = 0; i < record.childNodes.length; ++i)
        {
            htmltext += this.generateHelpHTML(record.childNodes[i], depth + 1);
        }
        
        //Parse links
        htmltext = htmltext.replace(
            /[*][*]([^*]+)[|][|]([/A-z, ]+)[*][*]/g,
            '<a style="cursor: pointer" onclick="Ext.getCmp(\''
                + this.getId() + '\').processLink(\'$2\')">$1</a>'
        );
        return htmltext;
    },
    
    processLink: function(path)
    {
        var tree = this.down('[name=helpindex]');
        tree.collapseAll();
        
        pathArray = path.split('/', undefined)
        record = tree.getRootNode();
        
        for(var i=0;i<pathArray.length;i++)
        {
            record.expand(false,function(){
                record = record.findChild('pageName', pathArray[i]);
                if (record == null)
                    i = pathArray.length;
            },this);
        }
        
        if(record != null)
        {
            this.updateHTML(record);
        }
    },
    
    //Reload the tree on an authenticationchange
    onAuthenticationChange: function()
    {
        if(!this.down('[name=helpindex]').getStore().isLoading())
        {
            var treestore = this.down('[name=helpindex]').getStore();
            treestore.getRootNode().removeAll();
            treestore.load({
                scope: this,
                callback: function() {
                    this.down('[name=helpindex]').expandPath(this.path,undefined,undefined,function(succes,lastNode){
                        if(succes)
                        {
                            this.updateHTML(lastNode);
                        }
                        else
                        {
                            //Go to the welcome page if the previous path is no longer accesible
                            this.updateHTML(this.down('[name=helpindex]').getRootNode().findChild('helpType','welcome'));
                        }
                    },this);
                }
            });
        }
    }
});
