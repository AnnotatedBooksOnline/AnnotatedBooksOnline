/*
 * Window base class.
 */

Ext.define('Ext.ux.WindowBase', {
    extend: 'Ext.window.Window',
    
    // Default settings.
    closable: true,
    resizable: false,
    draggable: true,
    constrain: true,
    modal: true,
    border: true,
    
    // Fixes bug in Ext JS where pressing escape will not fire a close event.
    onEsc: function(key, event)
    {
        event.stopEvent();
        
        this.close();
    }
});
