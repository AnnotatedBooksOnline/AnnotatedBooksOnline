/*
 * Information panel class.
 */

Ext.define('Ext.ux.InformationPanel', {
    extend: 'Ext.grid.Panel',
    alias : 'widget.informationpanel',

    initComponent: function()
    {
        this.store = {
            fields: ['name', 'value'],
            data  : [
                {name: 'Author', value: 'Leonardo da Vinci'},
                {name: 'Year',   value: '1497'}
            ]
        };

        this.columns = [
            {header: 'Name',  dataIndex: 'name',  flex: 1},
            {header: 'Value', dataIndex: 'value', flex: 1}
        ];

        this.callParent(arguments);
    }
});
