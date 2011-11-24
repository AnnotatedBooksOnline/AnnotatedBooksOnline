/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Book class.
 */

//class definition
function Book()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

//members
Book.prototype.bookId;

Book.prototype.documents;

//constructor
Book.prototype.constructor = function(bookId)
{
    //set members
    this.bookId = bookId;
    
    //initialize
    this.initialize();
}

/*
 * Public methods.
 */

Book.prototype.getDocument = function(index)
{
    //NOTE: we might create a document lazily
    
    return this.documents[index];
}

Book.prototype.getDocumentAmount = function(index)
{
    return this.documents.length;
}

Book.prototype.getDocuments = function()
{
    return this.documents;
}

/*
 * Private methods.
 */

Book.prototype.initialize = function()
{
    this.documents = [
        new Document(1, 151, 225, 5), //256, 256, 20 for Google maps
/*        new Document(2, 151, 225, 5), //256, 256, 20 for Google maps
        new Document(2, 151, 225, 5), //256, 256, 20 for Google maps
        new Document(2, 151, 225, 5), //256, 256, 20 for Google maps
        new Document(2, 151, 225, 5), //256, 256, 20 for Google maps
        new Document(2, 151, 225, 5)  //256, 256, 20 for Google maps*/
    ];
}
