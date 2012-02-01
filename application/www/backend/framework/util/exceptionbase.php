<?php
//[[GPL]]

/**
 * Exception base class.
 */
class ExceptionBase extends Exception
{
    private $id;
    private $timestamp;
    
    public function __construct($id)
    {
        // Set id and timestamp.
        $this->id        = $id;
        $this->timestamp = time();
        
        // Load translator.
        require_once('framework/util/translator.php');
        
        // Translate the message according to the id.
        $args    = func_get_args();
        $args[0] = 'error-' . $id;
        $message = call_user_func_array('__', $args);
        
        parent::__construct($message);
    }
    
    /**
     * Gets the exception its formatted timestamp.
     *
     * @return  The exception its timestamp.
     */
    public function getTimestamp()
    {
        return gmdate('Y/m/d H:i:s', $this->timestamp);
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
