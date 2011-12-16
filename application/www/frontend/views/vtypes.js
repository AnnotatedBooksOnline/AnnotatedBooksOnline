/*
 * Username uniqueness check.
 */

Ext.apply(Ext.form.VTypes, {
    uniqueUsername: function(value, field)
    {
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
                }
            }
        );
        
        return true;
    }
});

/*
 * Email uniqueness check and email parsing check.
 */

Ext.apply(Ext.form.VTypes, {
    checkEmail: function(value, field)
    {
        // Check if the email is a correct email address.
        var emailRegExp = /^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/;
    
        if (!emailRegExp.test(value))
        {
            field.markInvalid('Not a valid email address. The format should be \'me@email.com');
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
    }
});

/*
 * URL parsing check.
 */

Ext.apply(Ext.form.VTypes, {
    checkURL: function(value, field)
    {
        // Check if the url is a correct url.
        // Use this instead of url, because this one also allows url's without 'http://'
        var urlRegExp = /^((https?|ftp):\/\/)?[a-zA-Z0-9-.]+\.([a-zA-Z0-9]){2,4}([[\]a-zA-Z0-9/+=#%&_\.~?\-!]*)$/i;
    
        if (!urlRegExp.test(value))
        {
            field.markInvalid('Not a valid url. The format should be \'http://www.url.com\' or \'www.url.com/moreinformation\'.');
            return false;
        }
        
        return true;
    }
});

