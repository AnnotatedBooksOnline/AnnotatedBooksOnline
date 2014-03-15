/*
 * Binding information panel class.
 */

Ext.define('Ext.ux.FragmentsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.fragmentspanel',
    
    initComponent: function() 
    {
        var _this = this;
        
        this.bindingModel = this.viewer.getBinding().getModel();
        
        var genText = function(tag, text)
        {
            var el = $('<' + tag + '/>');
            el.text(text); // text() escapes input.
            return el;
        }
        
        var addEditButton = function(el, handler)
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
                        handler: handler
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
        
        // Library info.
        var libraryName = this.bindingModel.get('library').libraryName;
        var shelfmark = this.bindingModel.get('signature');
        
        // Provenance info.
        var owners = [];
        this.bindingModel.provenances().each(function(owner)
        {
            owners.push(owner.get('name'));
        });
        
        // Generate DOM for all books.
        var books = [];
        this.bindingModel.books().each(function(book)
        {
            // Page info.
            var firstPage = book.get('firstPage');
            var lastPage = book.get('lastPage');
            
                        
            // Generate book DOM.
            var el = $('<li/>');
            el.append(genText('h2', book.get('title')));
            var props = $('<ul/>');
            var meta = book.get('meta');
            var fixProps = function()
            {
                console.log('fixProps');
                props.empty();
                for (var i = 0; i < metaKeyTemplate.length; i++)
                {
                    var k = metaKeyTemplate[i];
                    var v = meta[k];
                    if (v)
                    {
                        var prop = $('<li/>');
                        prop.append(genText('span', k).addClass('metakey'));
                        prop.append(genText('span', v).addClass('metavalue'));
                        props.append(prop);
                    }
                }
                props.append(genText('li', 'Pages ' + firstPage + ' to ' + lastPage).addClass('pageinfo'));
            }
            book.store.on('datachanged', fixProps);
            fixProps();
            el.append(props);
            
            // Go to page on click.
            el.click(function()
            {
                _this.viewer.gotoPage(firstPage - 1);
            });
            el.prop('title', 'Go to page ' + firstPage);
            
            var wrapper = $('<div/>');
            addEditButton(wrapper, function() { Ext.create('Ext.ux.MetaEditorWindow', { book: book }).show(); });
            var fragment = $('<div class="fragment"/>');
            fragment.append(el);
            wrapper.append(fragment);
            
            books.push({
                el: wrapper,
                firstPage: firstPage,
                lastPage: lastPage,
                isCurrentBook: function(currentPage)
                {
                    return currentPage >= firstPage && currentPage <= lastPage;
                }
            });
        });
        this.books = books;
        var bookList = $('<ul/>');
        bookList.addClass('booklist');
        for (var i = 0; i < books.length; i++)
        {
            books[i].el.appendTo(bookList);
        }
        this.bookList = $('<div/>').append(bookList).addClass('bookinfo');
        
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

