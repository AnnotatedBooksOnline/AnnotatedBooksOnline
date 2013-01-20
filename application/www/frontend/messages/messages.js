// This files contains a single object with all project-specific messages that are shown to the user. 
// Keys represent identifiers and values format strings containing the messages. Use %n in such a format 
// string to let that specifier be replaced by the n'th parameter. Use %% for a '%'-character.

_messages = {
        'shelfmark': 'Shelfmark'
        
        // TODO .......
}

// Looks up and returns the message with the specified identifier. If a message has parameters, 
// you can also specify them here.
function _(messageId /*, params ... */)
{
    // Look up message.
    var msg = _messages[messageId];
    
    // Replace parameters in msg.
    for(var i = 1; i < arguments.length; ++i)
    {
        // Rather than replace, split-join replaces all occurences and apparantly is also faster. 
        msg = msg.split('%' + i).join(arguments[i]);
    }
    
    // Replace any '%%' with '%'.
    msg = msg.split('%%').join('%');
    
    // Return the formatted message.
    return msg;
}