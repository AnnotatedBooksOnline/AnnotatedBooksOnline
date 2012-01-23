/*
 * Help panel class.
 */

Ext.define('Ext.ux.HelpPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.helppanel',
    
    initComponent: function()
    {
        var _this = this;
    
        var treestore = Ext.create('Ext.data.TreeStore', {model: 'Ext.ux.HelpModel'});
        
        var defConfig = {
            layout: 'border',
            items: [{
                xtype: 'treepanel',
                title: 'Index',
                width: 200,
                region: 'west',
                store: treestore,
                columns: [{ xtype: 'treecolumn',text: 'Name',  dataIndex: 'pageName'}],
                collapsible: true,
                rootVisible: false,
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
                html: 'teset <br/> klik op een item in de tree'
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    updateHTML: function(record)
    {
        var page = record;
        
        while(page.get('HelpId').substring(2) != '-1')
        {
            page = page.parentNode;
        }
        
        record.expand(true);
        
        var htmltext = this.generateHelpHTML(page,2);
        this.getComponent(1).update(htmltext);
        /*
        var content = Ext.get(record.get('pageName'));
        var height = content.getHeight();//werkt niet, wordt 14
        this.getComponent(1).body.scrollTo("top", height, false);
        */
    },
    
    generateHelpHTML: function(record,dept)
    {
        var name = record.get('pageName');
        var htmltext = '<h' + dept + ' id="'+ name +'">' + name + '</h' + dept + '>';
        if(dept > 2)
        {
            htmltext += record.get('content');
        }
        
        for(var i=0;i<record.childNodes.length;i++)
        {
            htmltext += this.generateHelpHTML(record.childNodes[i],dept+1);
        }
        
        return htmltext;
    }
});
