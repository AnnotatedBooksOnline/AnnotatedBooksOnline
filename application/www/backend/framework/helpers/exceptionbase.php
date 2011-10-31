<?php
//[[GPL]]

/**
 * Exception base class.
 */
class ExceptionBase extends Exception
{
    public function __construct($code)
    {
        // Translate the message according to the code.
        $args    = func_get_args();
        $args[0] = 'error-' . $code;
        $message = call_user_func_array('_', $args);
        
        parent::__construct($message);
    }
}

// Derived common exceptions.
class FormatException extends ExceptionBase { }
