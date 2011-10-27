/*
 * Information panel class.
 */

Ext.define('Ext.ux.InformationPanel', {
    extend: 'Ext.grid.Panel',
    alias : 'widget.informationpanel',
    requires: [], //TODO: sepcify

    initComponent: function()
    {
        this.store = {
            fields: ['name', 'value'],
            data: [
                {name: 'Author', value: 'Leonardo da Vinci'},
                {name: 'Year',   value: '1497'}
            ]
        };

        this.columns = [
            {header: 'Name',  dataIndex: 'name',  flex: 1},
            {header: 'Value', dataIndex: 'value', flex: 1}
        ];

        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        //TODO: set document
    },
    
    setDocument: function(document)
    {
        //TODO: set document
    }
});
