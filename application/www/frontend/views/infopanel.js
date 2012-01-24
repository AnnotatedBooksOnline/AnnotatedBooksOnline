/*
 * Info panel class.
 */

Ext.define('Ext.ux.Info', {
    extend: 'Ext.Panel',
    alias: 'widget.infopanel',
    
    initComponent: function() 
    {        
        var _this = this;
        
        var defConfig = {
            bodyPadding: 10
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
        
        RequestManager.getInstance().request('Setting', 'getSetting', {setting: 'info-page'}, this,
            function(textPage)
            {
                var projectInfo = '<h2>Project info</h2><p>This website is free software released '
                    + 'under GNU General Public License version 3 and downloadable from '
                    + '<a href="http://www.github.com/AnnotatedBooksOnline/AnnotatedBooksOnline" '
                    + 'target="_blank" title="Go to the GitHub of this project">GitHub</a>. The '
                    + 'content of this website is not covered by this license, please read the '
                    + '<a href="#termsofuse" title="Go to the Terms of Use">Terms of Use</a> for '
                    + 'more information.</p><p>Copyright: Mathijs Baaijens, Iris Bekker, Renze '
                    + 'Droog, Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der '
                    + 'Ploeg, Gerben van Veenendaal, Tom Tervoort, Tom Wennink.</p>'
                
                var text = {
                    xtype: 'container',
                    items: {
                        xtype: 'panel',
                        border: false,
                        flex: 1,
                        width: 750,
                        cls: 'plaintext',
                        html: textPage + projectInfo
                    }
                };
                
                this.insert(this.items.length, [text]);
            }
        );
    }
});

