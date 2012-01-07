/*
 * Provenance model.
 */

Ext.define('Ext.ux.ProvenanceModel', {
    extend: 'Ext.ux.ModelBase',
    idProperty: 'personId',
    fields: ['personId', 'bindingId', 'name'],

    proxy: {
        type: 'requestmanager',
        controller: 'Provenance',
        model: 'Ext.ux.ProvenanceModel'
    }
});
