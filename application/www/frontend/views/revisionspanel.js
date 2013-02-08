Ext.define('Ext.ux.RevisionsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.revisionspanel',
    
    theStore: Ext.create('Ext.data.ArrayStore', {
        fields: ['groupname', 'revision', 'disabled',
                 'mutation', 'date', 'english', 'original', 'id'],
        data: []
    }),
    
    fetchData: function()
    {
        this.theStore.removeAll();
        
        var _this = this;
        
        var renderMutation = function(mutation)
        {
            switch(mutation)
            {
                case 1: return "Created";
                case 2: return "Modified";
                case 3: return "Deleted";
                case 4: return "Restored";
                default: return "";
            }
        };
        
        var renderAnnotationName = function(num, mutation, revisions)
        {
            var result = "Annotation " + num;
            if (mutation == 3)
            {
                result += " (" + revisions + " revisions, deleted)";
            }
            else if (mutation == 1)
            {
                result += " (1 revision)";
            }
            else
            {
                result += " (" + revisions + " revisions)";
            }
            return result;
        };
        
        RequestManager.getInstance().request(
            'Annotation',
            'getScanRevisions',
            {scanId: _this.scanId},
            _this,
            function(result)
            {
                var data = [];
                
                for(var i = 0; i < result.length; ++i)
                {                       
                    var revisions = result[i];
                    var annotationNum = i + 1;
                    var annotationGroupName = renderAnnotationName(
                            annotationNum, revisions[0].mutation, revisions.length);
                    
                    for(var j = 0; j < revisions.length; ++j)
                    {
                        var revisionNum = revisions.length - j;
                        
                        data.push([annotationGroupName,
                                   revisionNum, 
                                   (j == 0 || revisions[j].mutation == 3),
                                   renderMutation(revisions[j].mutation),
                                   Ext.Date.format(new Date(revisions[j].revisionCreateTime * 1000), 'F j, Y'), 
                                   revisions[j].transcriptionEng, 
                                   revisions[j].transcriptionOrig,
                                   revisions[j].revisedAnnotationId]);
                    }
                }
                
                this.theStore.add(data);
                this.theStore.group('groupname');
            },
            function()
            {
                return true;
            }
        );
    },
    
    restoreRevision: function(id)
    {
        RequestManager.getInstance().request(
            'Annotation',
            'restoreRevision',
            {revisedAnnotationId: id},
            this,
            function()
            {    
                Ext.MessageBox.alert('Annotation restored', 
                        'The annotation has been succesfully restored to this previous version.');
                
                this.fetchData();
                //this.refresh();
            },
            function()
            {
                return true;
            }
        );
    },
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            layout: 'fit',
            items: [{
                xtype: 'grid',
                name: 'revisionsgrid',
                border: false,
                features: [{
                    ftype:'grouping',
                    groupHeaderTpl: '{name}',
                    startCollapsed: true
                }],
                columns: [{
                    text:      'Revision',
                    flex:      1,
                    dataIndex: 'revision',
                    renderer:  'htmlEncode'
                },{
                    text:      'Date',
                    flex:      2,
                    dataIndex: 'date',
                    renderer:  'htmlEncode'
                },{
                    text:      'Action',
                    flex:      1,
                    dataIndex: 'mutation',
                    renderer:  'htmlEncode'
                },{
                    text:      'English',
                    flex:      5,
                    dataIndex: 'english',
                    renderer:  'htmlEncode'
                },{
                    text:      'Original',
                    flex:      5,
                    dataIndex: 'original',
                    renderer:  'htmlEncode'
                }],
                
                viewConfig: {
                    getRowClass: function(rec, rowIdx, params, store)
                    {
                        return rec.get('disabled') ? 'grid-row-disabled grid-row-light' : '';
                    }
                },
                
                store: _this.theStore,
                
                listeners: {
                    itemdblclick: function(view, record)
                    {
                        var revision = record.get('revision');
                        if(!record.get('disabled'))
                        {
                            Ext.Msg.show({
                                title: 'Restoring annotation',
                                msg: 'Are you sure you want to restore the transcription to this' 
                                   + ' previous version?',
                                buttons: Ext.Msg.YESNO,
                                icon: Ext.Msg.QUESTION,
                                callback: function(button)
                                {
                                    if (button == 'yes')
                                    {
                                        _this.restoreRevision(record.get('id'));
                                    }
                                }
                            });
                        }
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
        
        this.fetchData();
    }
            
});

