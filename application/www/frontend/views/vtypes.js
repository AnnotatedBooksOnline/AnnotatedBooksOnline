/*
 * Username uniqueness check and username parsing check.
 */

Ext.apply(Ext.form.VTypes, {
    checkUsername: function(value, field)
    {
        // Check if the username is a correct username.
        var usernameRegExp = /^[A-Za-z\d\._@' ]*$/;
    
        if (!usernameRegExp.test(value))
        {
            return false;
        }
        
        // Send existance check request.
        RequestManager.getInstance().request(
            'User',
            'usernameExists',
            {username: value},
            this,
            function(data)
            {
                if (data)
                {
                    field.markInvalid('Username already in use.');
                    return false;
                }
            }
        );
        
        return true;
    },
    checkUsernameText: 'Not a valid username. An username may only contain numbers, ' +
                       'letters (lowercase and uppercase), spaces, and symbols of this list: _.\'@'
});

/*
 * Email uniqueness check and email parsing check.
 */

Ext.apply(Ext.form.VTypes, {
    checkEmail: function(value, field)
    {
        // Check if the email is a correct email address.
        var emailRegExp = /^([\w]+)(.[\w]+)*@(students\.)?uu\.nl$/;
    
        if (!emailRegExp.test(value))
        {
            return false;
        }
        
        if (Authentication.getInstance().isLoggedOn()
            && value == Authentication.getInstance().getUserModel().get('email'))
        {
            return true;
        }
        
        // Send existance check request.
        RequestManager.getInstance().request(
            'User',
            'emailExists',
            {email: value},
            this,
            function(data)
            {
                if (data)
                {
                    field.markInvalid('Email already in use.');
                    return false;
                }
            }
        );
        
        return true;
    },
    checkEmailText: 'Not a valid email address. The format should be \'me@uu.nl\' or \'me@students.uu.nl\'.'
});

/*
 * URL parsing check.
 */

Ext.apply(Ext.form.VTypes, {
    checkURL: function(value, field)
    {
        // Check if the url is a correct url.
        // Use this instead of url, because this one also allows url's without 'http://'.
        // 
        var urlRegExp = /^((http|ftp)[s]?:\/\/|www\.)[a-z\d-\.]+\.([a-z\d]){2,4}(\/|$)/i;
        
        if (!urlRegExp.test(value))
        {
            return false;
        }
        
        return true;
    },
    checkURLText: 'Not a valid url. The format should be like ' +
                  '\'http://www.example.com\' or \'www.example.com/path/index.html\'.'
});
