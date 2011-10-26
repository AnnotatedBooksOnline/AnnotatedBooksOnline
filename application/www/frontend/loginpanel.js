/*
 * Login panel class.
 */

Ext.define('Ext.us.LoginPanel', {
    extend: 'Ext.grid.Panel',
    alias : 'widget.loginpanel',
    title : 'Login',

    initComponent: function() 
    {
        Ext.apply(this, {
            width: 350,
            bodyPadding: 10,
            bodyBorder: true,
            
            defaults: {
                anchor: '100%'
            },
            
            fieldDefaults: {
                labelAlign: 'left',
                msgTarget: 'none',
                invalidCls: '' //unset the invalidCls so individual fields do not get styled as invalid
            },

            /*
             * Listen for validity change on the entire form and update the combined error icon
             */
            listeners: {
                fieldvaliditychange: function() {
                    this.updateErrorState();
                },
                fielderrorchange: function() {
                    this.updateErrorState();
                }
            },

            updateErrorState: function() {
                var me = this,
                    errorCmp, fields, errors;

                if (me.hasBeenDirty || me.getForm().isDirty()) { //prevents showing global error when form first loads
                    errorCmp = me.down('#formErrorState');
                    fields = me.getForm().getFields();
                    errors = [];
                    fields.each(function(field) {
                        Ext.Array.forEach(field.getErrors(), function(error) {
                            errors.push({name: field.getFieldLabel(), error: error});
                        });
                    });
                    errorCmp.setErrors(errors);
                    me.hasBeenDirty = true;
                }
            },
            
            items: [{
                    xtype: 'textfield',
                    name: 'username',
                    fieldLabel: 'Username',
                    allowBlank: false,
                    minLength: 6
                }, {
                    xtype: 'textfield',
                    name: 'password',
                    fieldLabel: 'Password',
                    inputType: 'password',
                    allowBlank: false,
                    minLength: 8
                }
            ],
            dockedItems: [{
                xtype: 'container',
                dock: 'bottom',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                padding: '10 10 5',

                items: [{
                    xtype: 'component',
                    id: 'formErrorState',
                    baseCls: 'form-error-state',
                    flex: 1,
                    validText: 'Form is valid',
                    invalidText: 'Form has errors',
                    tipTpl: Ext.create('Ext.XTemplate', '<ul><tpl for="."><li><span class="field-name">{name}</span>: <span class="error">{error}</span></li></tpl></ul>'),

                    getTip: function() {
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

                    setErrors: function(errors) {
                        var me = this,
                            baseCls = me.baseCls,
                            tip = me.getTip();

                        errors = Ext.Array.from(errors);

                        // Update CSS class and tooltip content
                        if (errors.length) {
                            me.addCls(baseCls + '-invalid');
                            me.removeCls(baseCls + '-valid');
                            me.update(me.invalidText);
                            tip.setDisabled(false);
                            tip.update(me.tipTpl.apply(errors));
                        } else {
                            me.addCls(baseCls + '-valid');
                            me.removeCls(baseCls + '-invalid');
                            me.update(me.validText);
                            tip.setDisabled(true);
                            tip.hide();
                        }
                    }
                }, {
                    xtype: 'button',
                    formBind: true,
                    disabled: true,
                    text: 'Login',
                    width: 140,
                    handler: function() {
                        var form = this.up('form').getForm();

                        /* Normally we would submit the form to the server here and handle the response...
                        form.submit({
                            clientValidation: true,
                            url: 'login.php',
                            success: function(form, action) {
                               //...
                            },
                            failure: function(form, action) {
                                //...
                            }
                        });
                        */

                        if (form.isValid()) {
                            Ext.Msg.alert('Submitted Values', form.getValues(true));
                        }
                    }
                }]
            }]
        });
        
        this.callParent(arguments);
    }
});