/*
 * Notes model.
 */

Ext.define('Ext.ux.NoteModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'userId',
    fields: ['userId', 'text'],

    proxy: {
        type: 'requestmanager',
        controller: 'Note',
        model: 'Ext.ux.NoteModel'
    }
});
