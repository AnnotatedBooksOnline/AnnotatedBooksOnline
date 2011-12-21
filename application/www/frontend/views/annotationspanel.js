/*
 * Annotations display & edit panel.
 */

var langStore = Ext.create('Ext.data.Store', {
    fields: ['lang', 'name'],
    data : [{
        lang: "eng",
        name:"English"
    },{
        lang: "orig",
        name: "Original language"
    }]
});

Ext.define('Ext.ux.AnnotationsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.annotationspanel',
    
    initComponent: function()
    {
        var _this = this;
        var defConfig = {
            border: false,
            layout: 'border',
            flex: 0,
            height: 600,
            items: [{
                xtype: 'panel',
                region: 'north',
                html: 'Please select an annotation below.',
                bodyPadding: 5,
                border: false,
                autoScroll: true,
                height: 200,
                resizable: { handles: 's' }
            },{
                xtype: 'annotationsgrid',
                region: 'center',
                height: 350
            },{
                xtype: 'panel',
                name: 'annotationcontrols',
                region: 'south',
                height: 70,
                border: false,
                bodyPadding: 10,
                items: [{
                    xtype: 'panel',
                    border: 'false',
                    layout: 'hbox',
                    items: [{
                        xtype: 'button',
                        text: 'Edit mode',
                        width: 135,
                        name: 'editmode',
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            this.up('annotationspanel').down('annotationsgrid').setEditMode();
                            this.up('annotationspanel').getComponent(0).hide();
                            this.hide();
                            this.up('[name=annotationcontrols]').down('[name=savechanges]').show();
                            this.up('[name=annotationcontrols]').down('[name=newtranscription]').show();
                            this.up('[name=annotationcontrols]').down('[name=viewmode]').show();
                        }
                    },{
                        xtype: 'button',
                        text: 'Back to view mode',
                        width: 135,
                        name: 'viewmode',
                        hidden: true,
                        style: 'margin-right: 5px',
                        handler: function()
                        {
                            this.up('annotationspanel').down('annotationsgrid').setDisplayMode();
                            this.up('annotationspanel').getComponent(0).show();
                            this.hide();
                            this.up('[name=annotationcontrols]').down('[name=savechanges]').hide();
                            this.up('[name=annotationcontrols]').down('[name=newtranscription]').hide();
                            this.up('[name=annotationcontrols]').down('[name=editmode]').show();
                        }
                    },{
                        xtype: 'button',
                        text: 'New transcription',
                        width: 135,
                        name: 'newtranscription',
                        hidden: true,
                        handler: function()
                        {
                            // TODO: Show 'new transcription' tools.
                        }
                    }]
                },{
                    xtype: 'panel',
                    border: 'false',
                    layout: 'hbox',
                    style: 'margin-top: 5px',
                    items: [{
                        xtype: 'combobox',
                        store: langStore,
                        queryMode: 'local',
                        displayField: 'name',
                        valueField: 'lang',
                        width: 135,
                        name: 'langchoose',
                        style: 'margin-right: 5px',
                        forceSelection: true,
                        editable: false,
                        listeners: {
                            select: function()
                            {
                                _this.setLanguage(this.getValue());
                            }
                        }
                    },{
                        xtype: 'button',
                        text: 'Save changes',
                        width: 135,
                        name: 'savechanges',
                        hidden: true,
                        disabled: true,
                        handler: function()
                        {
                            // TODO: Actually save changes.
                            this.setDisabled(true);
                        }
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
        
        var _this = this;
        
        this.ownerCt.on('expand', function()
        {
            var langChooser = _this.down('[name=langchoose]');
            langChooser.select('eng');
            langChooser.fireEvent('select', langChooser, {});
        }, {single: true});
    },
    
    setLanguage: function(lang)
    {
        if (this.getComponent(0).activeRecord != undefined)
        {
            this.getComponent(0).body.update(this.getComponent(0).activeRecord.get(lang));
        }
        this.down('annotationsgrid').setLanguage(lang);
    },
    
    setLargeAnnotation: function(record)
    {
        this.getComponent(0).activeRecord = record;
        this.getComponent(0).body.update(record.get(this.down('[name=langchoose]').getValue()));
    },
    
    markDirty: function()
    {
        this.getComponent(2).down('[name=savechanges]').setDisabled(false);
    }
});

// TODO: remove when coupled to database
Ext.define('DataObject', {
    extend: 'Ext.data.Model',
    fields: ['annId', 'bookId', 'page', 'eng', 'orig', 'color']
});

Ext.define('Ext.ux.AnnotationsGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.annotationsgrid',
    
    initComponent: function()
    {
        var _this = this;
        
        var testData = [{
            annId: 1,
            bookId: 1,
            page: 1,
            eng: 'Hello, world!',
            orig: 'Hallo, wereld!',
            color: 'FF00FF'
        },{
            annId: 2,
            bookId: 1,
            page: 1,
            eng: 'This is a test annotation.',
            orig: 'Ceci n\'est pas un annotation.',
            color: 'FFFF00'
        },{
            annId: 3,
            bookId: 1,
            page: 1,
            eng: 'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?',
            orig: 'Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet, consectetur, adipiscing velit, sed quia non numquam do eius modi tempora incididunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur?',
            color: '00FFFF'
        },{
            annId: 4,
            bookId: 1,
            page: 1,
            eng: 'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.',
            orig: 'At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat...',
            color: '000000'
        }];

        var annotationStore = Ext.create('Ext.data.Store', {
            model: 'DataObject',
            data: testData
        });
        
        var colorColumn = {
            dataIndex: 'color',
            renderer: function(color, meta)
            {
                meta.style = 'background-color: #' + color;
                meta.tdCls = 'grid-valign-middle';
                return '';
            },
            width: 10
        };
        
        var getLanguageColumn = function(lang)
        {
            return {
                dataIndex: lang,
                renderer: function(text, meta)
                {
                    meta.style = 'white-space: normal;';
                    if (text.length >= 120)
                    {
                        text = text.substr(0, 117) + '...';
                    }
                    return text;
                }
            };
        };

        var getDisplayColumns = function(lang)
        {
            return [colorColumn, getLanguageColumn(lang)];
        };
        
        var getEditColumns = function(lang)
        {
            return [colorColumn, getLanguageColumn(lang),
            {
                dataIndex: 'annId',
                renderer: function(annId, meta, rec, r, c, s, view)
                {
                    meta.tdCls = 'grid-valign-bottom';
                    
	                var id = Ext.id();
                    setTimeout(function()
	                {
	                    try
	                    {
		                    new Ext.Button(
		                    {
			                    renderTo: id,
			                    id: id,
			                    text: 'Edit'
		                    });
		                }
		                catch(e)
		                {
		                    // Too late
		                }
	                }, 1);

	                return '<div id="' + id + '"></div>';
                },
                width: 20,
                flex: 0
            }];
        };
        
        var displayMode = {
            xtype: 'gridpanel',
            viewConfig: {
                stripeRows: false,
                listeners: {
                    itemclick: function(grid, record)
                    {
                        this.up('annotationspanel').setLargeAnnotation(record);
                    },
                    itemmouseenter: function(grid, record)
                    {
                        // TODO: highlight polygon
                    },
                    itemmouseleave: function(grid, record)
                    {
                        // TODO: un-highlight polygon
                    }
                }
            },
            hideHeaders: true,
            store: annotationStore,
            columns: getDisplayColumns('orig'),
            forceFit: true,
            autoScroll: true,
            border: false
        };
        
        var editMode = {
            xtype: 'gridpanel',
            viewConfig: {
                stripeRows: false,
                listeners: {
                    itemupdate: function()
                    {
                        console.log('update');
                        this.up('annotationspanel').markDirty();
                    }
                }
            },
            hideHeaders: true,
            store: annotationStore,
            columns: getEditColumns('orig'),
            forceFit: true,
            autoScroll: true,
            border: false
        };
        
        var defConfig = {
            border: false,
            layout: 'card',
            items: [displayMode, editMode],
            setLanguage: function(lang)
            {
                var _this = this;
                setTimeout(function()
                {
                    _this.getComponent(0).reconfigure(null, getDisplayColumns(lang));
                    _this.getComponent(1).reconfigure(null, getEditColumns(lang));
                }, 1);
            }
        };
        
        Ext.apply(this, defConfig);
        this.callParent();
    },
    
    setEditMode: function()
    {
        this.getLayout().setActiveItem(1);
    },
    
    setDisplayMode: function()
    {
        this.getLayout().setActiveItem(0);
    }
});
