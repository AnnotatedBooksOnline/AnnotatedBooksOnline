/*
 * Binding information panel class.
 */

Ext.define('Ext.ux.FragmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.fragmentspanel',
    
    initComponent: function() 
    {
        var _this = this;
        this.bookList = $('<div/>').addClass('bookinfo');
        
        this.bindingModel = this.viewer.getBinding().getModel();
        
        var genText = function(tag, text, hoverannots)
        {
            var el = $('<' + tag + '/>');
            text = escape(text);
            if (hoverannots)
            {
                text = IDCode.replaceID(text, function(id)
                {
                    return '<span class="annotation-ref" onmouseover="createAnnotationTooltip(this, '
                           + id + ')" onmouseout="destroyAnnotationTooltip(this)">[Annotation]</span>';
                });
            }
            else
            {
                text = IDCode.replaceID(text, '[Annotation]');
            }
            el.html(text);
            return el;
        }
        
        var addEditButton = function(el, handler, fragId, book)
        {
            var id = 'button_' + Ext.id();            
            setTimeout(function()
            {
                // Empty div as there may be an older button.
                $('#' + id).empty();
                try
                {
                    new Ext.Button({
                        renderTo: id,
                        iconCls: 'fragment-edit-icon',
                        handler: handler,
                        fragId: fragId,
                        book: book,
                        tooltip: 'Edit metadata'
                    });
                }
                catch (e)
                {
                    // Model might already have been removed/replaced.
                }
            }, 1);
            
            var btn = $('<div class="fragmentedit" id="' + id + '">&nbsp;</div>');
            btn.appendTo(el);
        };
        
        var addAppendButton = function(el, handler, book)
        {
            var id = 'button_' + Ext.id();            
            setTimeout(function()
            {
                // Empty div as there may be an older button.
                $('#' + id).empty();
                
                try
                {
                    new Ext.Button({
                        renderTo: id,
                        iconCls: 'fragment-add-icon',
                        handler: handler,
                        book: book,
                        tooltip: 'Add fragment part'
                    });
                }
                catch (e)
                {
                    // Model might already have been removed/replaced.
                }
            }, 1);
            
            var btn = $('<div class="fragmentappend" id="' + id + '">&nbsp;</div>');
            btn.appendTo(el);
        };
        
        // Library info.
        var libraryName = this.bindingModel.get('library').libraryName;
        var shelfmark = this.bindingModel.get('signature');
        
        // Provenance info.
        var owners = [];
        this.bindingModel.provenances().each(function(owner)
        {
            owners.push(owner.get('name'));
        });
        
        function genBookList()
        {
            // Generate DOM for all books.
            var books = [];
            _this.bindingModel.books().each(function(book)
            {
                // Page info.
                var firstPage = book.get('firstPage');
                var lastPage = book.get('lastPage');
                
                var frags = Object.keys(book.get('meta'));
                frags.sort(function(a, b) { if (a == -1) return -1; if (b == -1) return 1; return 0; });
                if (frags[0] != -1)
                {
                    frags.unshift(-1);
                }
                
                for (var x = 0; x < frags.length; x++)
                {
                    var fragId = frags[x];
                    var meta = book.get('meta')[fragId] || {};
                    
                    // Generate fragment DOM.
                    var el = $('<li/>');
                    var title = fragId == -1 ? book.get('title') : ((meta['Part'] || {}).value || '[Unknown part]');
                    el.append(genText('h2', title, true));
                    var props = $('<ul/>');
                    if (fragId == -1)
                    {
                        props.append(genText('li', 'Pages ' + firstPage + ' to ' + lastPage).addClass('pageinfo'));
                    }
                    for (var i = 0; i < metaKeySimple.length; i++)
                    {
                        var k = metaKeySimple[i];
                        if (k instanceof Array && (k[1] == 'double' || k[1] == 'simple'))
                        {
                            k = k[0];
                            var v = (meta[k] || {}).value;
                            if (v)
                            {
                                var prop = $('<li/>');
                                prop.append(genText('span', k).addClass('metakey'));
                                prop.append(genText('span', v, true).addClass('metavalue'));
                                props.append(prop);
                            }
                        }
                    }
                    el.append(props);
                    
                    // Go to page on click.
                    el.click(function()
                    {
                        _this.viewer.gotoPage(firstPage - 1);
                    });
                    el.prop('title', 'Go to page ' + firstPage);
                    
                    var wrapper = $('<div/>');
                    addEditButton(wrapper, function() { Ext.create('Ext.ux.MetaEditorWindow', { book: this.book, fragmentId: this.fragId }).show(); }, fragId, book);
                    if (fragId == -1)
                    {
                        addAppendButton(wrapper, function() { Ext.create('Ext.ux.MetaEditorWindow', { book: this.book, fragmentId: (Math.random() * Math.pow(2, 62)).toFixed() }).show(); }, book);
                    }
                    var fragment = $('<div class="fragment"/>');
                    fragment.append(el);
                    wrapper.append(fragment);
                    wrapper.addClass('wrapper');
                    if (fragId != -1)
                    {
                        wrapper.addClass('subwrapper');
                    }
                                
                    books.push({
                        el: wrapper,
                        firstPage: firstPage,
                        lastPage: lastPage,
                        isCurrentBook: function(currentPage)
                        {
                            return currentPage >= firstPage && currentPage <= lastPage;
                        }
                    });
                }
            });
            _this.books = books;
            var bookList = $('<ul/>');
            bookList.addClass('booklist');
            for (var i = 0; i < books.length; i++)
            {
                books[i].el.appendTo(bookList);
            }
            _this.bookList.empty();
            _this.bookList.append(bookList);
        }
        genBookList();
        
        this.bindingModel.books().each(function(book)
        {
            book.store.on('datachanged', genBookList);
        });
        
        // Generate DOM for binding info.
        var bindingInfo = $('<div/>');
        bindingInfo.addClass('bindinginfo');
        this.bindingInfo = bindingInfo;

        var defConfig = {
            border: false,
            bodyPadding: 5
        };
        
        Ext.apply(this, defConfig);
        
        this.callParent();
    },
    
    afterRender: function()
    {
        this.callParent();
        
        $('#' + this.body.id).append(this.bookList);
        $('#' + this.body.id).append(this.bindingInfo);
        this.viewer.getEventDispatcher().bind('pagechange', this, this.updateCurrentBook);
        this.updateCurrentBook();
        
        // Watch for authentication changes.
        var eventDispatcher = Authentication.getInstance().getEventDispatcher();
        eventDispatcher.bind('modelchange', this, this.onAuthenticationChange);
        
        this.onAuthenticationChange();
    },
    
    destroy: function()
    {
        // Unsubscribe from authentication changes.
        Authentication.getInstance().getEventDispatcher().unbind('modelchange', this, this.onAuthenticationChange);
        
        this.callParent();
    },
    
    onAuthenticationChange: function()
    {
        if (Authentication.getInstance().hasPermissionTo('edit-meta'))
        {
            this.addCls('permission-edit-meta');
        }
        else
        {
            this.removeCls('permission-edit-meta');
        }
    },
    
    updateCurrentBook: function()
    {
        var page = this.viewer.getPage() + 1;
        for (var i = 0; i < this.books.length; i++)
        {
            if (this.books[i].isCurrentBook(page))
            {
                this.books[i].el.addClass('currentbook');
            }
            else
            {
                this.books[i].el.removeClass('currentbook');
            }
        }
    }
});

