/*
 * Notes model.
 */

Ext.define('Ext.ux.NotesModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'userId',
    fields: ['userId', 'text'],

    proxy: {
        type: 'requestmanager',
        controller: 'Note',
        model: 'Ext.ux.NotesModel'
    }
});
