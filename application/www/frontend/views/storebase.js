/*
 * Own store class with a few standard values. Use this one instead of Ext.data.Store.
 */

Ext.define('Ext.ux.StoreBase', {
    extend: 'Ext.data.Store',
    pageSize: 10,
    remoteSort: true,
    remoteFilter: true
});
