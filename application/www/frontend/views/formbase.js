/*
 * Form base class.
 */

Ext.define('Ext.ux.FormBase', {
    extend: 'Ext.form.Panel',
    requires: ['*'], // TODO: specify
    
    initComponent: function() 
    {
        var _this = this;
        var defConfig = {
            bodyPadding: 10,
            bodyBorder: true,
            
            defaultType: 'textfield',
            
            defaults: {
                anchor: '100%'
            },
            
            fieldDefaults: {
                allowBlank: false,
                //msgTarget: 'none',
                //invalidCls: '' // Unset the invalidCls so individual fields do not get styled as invalid.
            },

            // Listen for validity change on the entire form and update the combined error icon.
            listeners: {
                //fieldvaliditychange: function() { _this.updateErrorState(); },
                //fielderrorchange:    function() { _this.updateErrorState(); }
            },

            /*
            dockedItems: [{
                xtype: 'container',
                dock: 'bottom',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                padding: '10 10 5',

                items: [/*{
                    xtype: 'component',
                    id: 'formErrorState',
                    baseCls: 'form-error-state',
                    flex: 1,
                    validText: 'Form is valid',
                    invalidText: 'Form has errors',
                    tipTpl: Ext.create('Ext.XTemplate', '<ul><tpl for="."><li><span class="field-name">{name}</span>: <span class="error">{error}</span></li></tpl></ul>'),

                    getTip: function()
                    {
                        var tip = this.tip;
                        if (!tip) {
                            tip = this.tip = Ext.widget('tooltip', {
                                target: this.el,
                                title: 'Error Details:',
                                autoHide: false,
                                anchor: 'top',
                                mouseOffset: [-11, -2],
                                closable: true,
                                constrainPosition: false,
                                cls: 'errors-tip'
                            });
                            
                            tip.show();
                        }
                        
                        return tip;
                    },

                    setErrors: function(errors)
                    {
                        var baseCls = this.baseCls,
                            tip     = this.getTip();

                        errors = Ext.Array.from(errors);

                        // Update CSS class and tooltip content.
                        if (errors.length)
                        {
                            this.addCls(baseCls + '-invalid');
                            this.removeCls(baseCls + '-valid');
                            this.update(this.invalidText);
                            tip.setDisabled(false);
                            tip.update(this.tipTpl.apply(errors));
                        }
                        else
                        {
                            this.addCls(baseCls + '-valid');
                            this.removeCls(baseCls + '-invalid');
                            this.update(this.validText);
                            tip.setDisabled(true);
                            tip.hide();
                        }
                    }
                }]
            }],
            
            updateErrorState: function()
            {
                var errorCmp, fields, errors;

                // Prevent showing global error when form first loads.
                if (this.hasBeenDirty || this.getForm().isDirty())
                {
                    errorCmp = this.down('#formErrorState');
                    fields = this.getForm().getFields();
                    errors = [];
                    fields.each(function(field) {
                        Ext.Array.forEach(field.getErrors(), function(error)
                            {
                                errors.push({name: field.getFieldLabel(), error: error});
                            });
                    });
                    
                    errorCmp.setErrors(errors);
                    this.hasBeenDirty = true;
                }
            }
            */
        };
        
        Ext.apply(this, defConfig);
        
        // Fix bug with disabled button in ExtJS
        this.on('afterrender', function(me)
            {
                delete me.form._boundItems;
            });
        
        this.callParent();
    }
});
