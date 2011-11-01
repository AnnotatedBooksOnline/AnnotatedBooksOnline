<?php
//[[GPL]]

/**
 * Exception base class.
 */
class ExceptionBase extends Exception
{
    private $id;
    
    public function __construct($id)
    {
        $this->id = $id;
        
        // Translate the message according to the id.
        $args    = func_get_args();
        $args[0] = 'error-' . $id;
        $message = call_user_func_array('_', $args);
        
        parent::__construct($message);
    }
    
    /**
     * Gets the exception unique identifier.
     *
     * @return  Identifier to the exception.
     */
    public function getIdentifier()
    {
        return $this->id;
    }
}

// Derived common exceptions.
class FormatException extends ExceptionBase { }
