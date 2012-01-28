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
        
        // Load translator.
        require_once('framework/util/translator.php');
        
        // Translate the message according to the id.
        $args    = func_get_args();
        $args[0] = 'error-' . $id;
        $message = call_user_func_array('__', $args);
        $timestamp = gmdate('Y/m/d H:i:s');
        
        parent::__construct($timestamp . ' - ' . $message);
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

// Make all error exceptions.
error_reporting(E_ALL | E_STRICT);
set_error_handler(
    function($errNumber, $errMessage, $errorFile, $errorLine)
    {
        throw new ErrorException($errMessage, $errNumber, 0, $errorFile, $errorLine);
    });
