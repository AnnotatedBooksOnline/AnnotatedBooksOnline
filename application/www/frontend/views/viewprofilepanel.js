/* * View profile class. */Ext.define('Ext.ux.ViewProfilePanel', {    extend: 'Ext.form.Panel',    alias: 'widget.viewprofilepanel',    requires: ['*'], // TODO: specify        initComponent: function()     {        var _this = this;                var defConfig = {            flex: 1,            items: [{                xtype: 'propertygrid',                propertyNames: {                    email: 'E-mail',                    firstName: 'First name',                    lastName: 'Last name',                    affiliation: 'Affiliation',                    occupation: 'Occupation',                    website: 'Website'                },                // TODO: ajax request                source: {                    "email":"r3nz3@email.com",                    "firstName":"Renze",                    "lastName":"Nat",                    "affiliation":"a",                    "occupation":"b",                    "website":"http://www.uu.nl/"                },                listeners: {                    // Prevent editing (as this is a view profile, not edit)                    beforeedit: function() {                        return false;                    }                },                hideHeaders : true            }            // TODO: add information like last added annotation, forum post, ...            ]        };                Ext.apply(this, defConfig);                this.callParent();    }});