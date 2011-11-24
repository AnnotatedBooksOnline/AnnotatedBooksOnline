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
                    field.markInvalid('Username already in use');
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
    emailCheck: function(value, field)
    {
        // Check if the email is a correct email address
        var emailRegExp = /^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/;
    
        if (!emailRegExp.test(value))
        {
            return false;
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
                    field.markInvalid('Email already in use');
                }
            }
        );
        
        return true;
    }
});