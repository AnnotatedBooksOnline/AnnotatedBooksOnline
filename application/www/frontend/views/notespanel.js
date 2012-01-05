/*
 * Notes panel class.
 */

Ext.define('Ext.ux.Notespanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.notespanel',
    
    initComponent: function()
    {
        var _this = this;
        
        var defConfig = {
            border: false,
            layout: 'fit',
            items: [{
                xtype: 'textarea',
                name: 'note-area',
                grow: false,
                allowBlank: true,
                listeners: {
                    change: function(area, value)
                    {
                        _this.onNoteChange(value);
                    }
                }
            }]
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    onNoteChange: function(value)
    {
        // Set new value.
        this.note.set('text', value);
        
        // Set timer, to not generate too many request.
        if (this.timer === undefined)
        {
            // Save value every second.
            var _this = this;
            this.timer = setTimeout(
                function()
                {
                    // Unset timer.
                    _this.timer = undefined;
                    
                    // Save note.
                    _this.note.save();
                }, 1000);
        }
        
        // Trigger a change.
        Ext.ux.Notespanel.getEventDispatcher().trigger('change', this, value);
    },
    
    afterRender: function()
    {
        this.callParent();
        
        this.noteArea = this.down('[name=note-area]');
        
        // Load user note.
        this.setLoading(true);
        
        var userId = Authentication.getInstance().getUserId();
        
        var _this = this;
        
        Ext.ux.NoteModel.load(userId, {
            success: function(note)
            {
                _this.note = note;
                _this.noteArea.setRawValue(note.get('text'));
                
                _this.setLoading(false);
            }
        });
        
        // Let notes stay in sync.
        Ext.ux.Notespanel.getEventDispatcher().bind('change', this,
            function(event, notesPanel, value)
            {
                if (notesPanel !== this)
                {
                    this.noteArea.setRawValue(value);
                }
            });
    },
    
    // Common event dispatcher of all notes panels.
    statics: {
        eventDispatcher: new EventDispatcher(),
        
        getEventDispatcher: function()
        {
            return Ext.ux.Notespanel.eventDispatcher;
        }
    }
});
