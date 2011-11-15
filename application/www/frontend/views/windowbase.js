/*
 * Window base class.
 */

Ext.define('Ext.ux.WindowBase', {
    extend: 'Ext.window.Window',
    
    // Fixes bug in Ext JS where pressing escape will not fire a close event.
    onEsc: function(key, event)
    {
        event.stopEvent();
        
        this.close();
    }
});
