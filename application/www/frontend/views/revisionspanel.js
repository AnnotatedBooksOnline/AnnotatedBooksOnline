Ext.define('Ext.ux.RevisionsPanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.revisionspanel',
    
    theStore: Ext.create('Ext.data.ArrayStore', {
        fields: ['annotation', 'revision', 'date','english','original'],
        data: []
    }),
    
    fetchData: function()
    {
        this.theStore.removeAll();
        
        var _this = this;
        
        RequestManager.getInstance().request(
            'Annotation',
            'getScanRevisions',
            {scanId: _this.scanId},
            _this,
            function(result)
            {
                var data = [];
                
                _this.revisionIds = new Array(result.length);
                for(var i = 0; i < result.length; ++i)
                {                       
                    var transEng = result[i].transcriptionEng;
                    var transOrig = result[i].transcriptionOrig;
                    var revisions = result[i].revisions;
                    var annotationNum = i + 1;
                    
                    data.push([annotationNum, 'Current', '', transEng, transOrig]);
                    
                    _this.revisionIds[annotationNum] = new Array(result.length);
                    for(var j = 0; j < revisions.length; ++j)
                    {
                        var revisionNum = revisions.length - j;
                        
                        data.push([annotationNum, 
                                   revisionNum, 
                                   revisions[j].revisionCreateTime, 
                                   revisions[j].transcriptionEng, 
                                   revisions[j].transcriptionOrig]);
                        
                        _this.revisionIds[annotationNum][revisionNum] = revisions[j].revisedAnnotationId;
                    }
                }
                
                this.theStore.add(data);
            },
            function()
            {
                return true;
            }
        );
    },
    
    revisionIds: [],
    
    restoreRevision: function(annotation, revision)
    {
        var id = this.revisionIds[annotation][revision];
        
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
            items: [{
                xtype: 'grid',
                name: 'revisionsgrid',
                border: false,
                columns: [{
                    text:      'Annotation number',
                    flex:      1,
                    dataIndex: 'annotation',
                    renderer:  'htmlEncode'
                },{
                    text:      'Revision',
                    flex:      1,
                    dataIndex: 'revision',
                    renderer:  'htmlEncode'
                },{
                    text:      'Date',
                    flex:      1,
                    dataIndex: 'date',
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
                
                store: _this.theStore,
                
                listeners: {
                    itemdblclick: function(view, record)
                    {
                        var revision = record.get('revision');
                        if(revision == 'Current')
                        {
                            Ext.MessageBox.alert('Current revision', 'This already is the current'
                                               + ' version of the transcriptions for this annotation.');
                        }
                        else
                        {
                            Ext.Msg.show({
                                title: 'Restoring annotation.',
                                msg: 'Are you sure you want to restore the transcription to this' 
                                   + ' previous version? All later revisions will be DELETED and' 
                                   + ' can not be retrieved.',
                                buttons: Ext.Msg.YESNO,
                                icon: Ext.Msg.QUESTION,
                                callback: function(button)
                                {
                                    if (button == 'yes')
                                    {
                                        _this.restoreRevision(record.get('annotation'), revision);
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

