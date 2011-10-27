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
Book.prototype.id;

Book.prototype.documents;

//constructor
Book.prototype.constructor = function(id)
{
    //set members
    this.id = id;
    
    //initialize
    this.initialize();
}

/*
 * Public methods.
 */

Book.prototype.initialize = function()
{
    this.documents = [];
}
