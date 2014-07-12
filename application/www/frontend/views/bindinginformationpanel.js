/*
 * Binding information panel class.
 */

Ext.define('Ext.ux.BindingInformationPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.bindinginformationpanel',
    
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
            
            // Author info.
            var authors = [];
            book.authors().each(function(author)
            {
                authors.push(author.get('name'));
            });
            
            // Publisher info.
            var placePublished = book.get('placePublished');
            var publisher = book.get('publisher');
            var version = book.get('printVersion');
            var pubInfo = [];
            if (placePublished)
            {
                pubInfo.push('in ' + placePublished);
            }
            if (publisher)
            {
                pubInfo.push('by ' + publisher);
            }
            pubInfo.push('in ' + book.getTimePeriod());
            if (version)
            {
                pubInfo.push('edition ' + version);
            }
                        
            // Generate book DOM.
            var el = $('<li/>');
            el.append(genText('h2', book.get('title')));
            var props = $('<ul/>');
            if (authors.length > 0)
            {
                props.append(genText('li', authors.join(', ')).addClass('authorinfo'));
            }
            if (pubInfo.length > 0)
            {
                props.append(genText('li', 'Published ' + pubInfo.join(' ')).addClass('pubinfo'));
            }
            props.append(genText('li', 'Scans ' + firstPage + ' to ' + lastPage).addClass('pageinfo'));
            el.append(props);
            
            // Go to page on click.
            el.click(function()
            {
                _this.viewer.gotoPage(firstPage - 1);
            });
            el.prop('title', 'Go to scan ' + firstPage);
            
            books.push({
                el: el,
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
        var provenanceInfo = $('<p/>');
        if (owners.length > 0)
        {
            provenanceInfo.text('Owned by ' + owners.join(', '));
        }
        else
        {
            provenanceInfo.text('Provenance unknown');
        }
        provenanceInfo.addClass('provenanceinfo');
        bindingInfo.append(provenanceInfo);
        var libraryInfo = $('<p/>');
        libraryInfo.text(libraryName + ', ' + shelfmark);
        libraryInfo.addClass('libraryinfo');
        bindingInfo.append(libraryInfo);
        bindingInfo.addClass('bindinginfo');
        this.bindingInfo = bindingInfo;

        var defConfig = {
            border: false,
            flex: 1,
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

