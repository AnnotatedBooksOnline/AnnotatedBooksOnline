/*
 * Use strict mode if available.
 */

"use strict";

/*
 * Book class.
 */

// Class definition.
function Book()
{
    if (arguments.length)
        this.constructor.apply(this, arguments);
}

// Fields.
Book.prototype.bookId;

Book.prototype.documents;

// Constructor.
Book.prototype.constructor = function(model)
{
    // Set members.
    this.model  = model;
    this.bookId = model.get('bookId');
    
    // Initialize.
    this.initialize();
}

/*
 * Public methods.
 */

Book.createFromId = function(bookId, obj, onSuccess, onError)
{
    // On success, 
    var successCallback = function(model)
        {
            var book = new Book(model);
            
            onSuccess.call(this, book);
        };
    
    Ext.ux.BookModel.load(bookId, {
        scope: obj,
        success: successCallback,
        failure: onError
    });
}

Book.prototype.getDocument = function(index)
{
    // TODO: Really do something here.
    //return new Document(1, 151, 225, 6);
    
    
    // Create document if it does not exist yet.
    if (this.documents[index] === undefined)
    {
        this.documents[index] = Book.documentFromScan(this.scans[index]);
    }
    
    return this.documents[index];
}

Book.prototype.getScan = function(index)
{
    return this.scans[index];
}

Book.prototype.getScans = function()
{
    return this.scans;
}

Book.prototype.getScanAmount = function()
{
    return this.scans.length;
}

Book.prototype.getModel = function()
{
    return this.model;
}

/*
 * Private methods.
 */

Book.prototype.initialize = function()
{
    this.scans = this.model.scans().data.items;
    
    this.documents = new Array(this.scans.length);
}

Book.documentFromScan = function(scan)
{ 
    return new Document(
        scan.get('width'),
        scan.get('height'),
        scan.get('zoomLevels'),
        function(row, col, zoomLevel)
        {
            return 'tiles/tile_' + zoomLevel + '_' + col + '_' + row + '.jpg';
        }
    );
}
