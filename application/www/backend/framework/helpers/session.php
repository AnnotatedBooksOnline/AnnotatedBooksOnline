<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';
require_once 'framework/helpers/configuration.php';

/**
 * Represents the current user session.
 */
class Session extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** Session prefix. */
    private $prefix;
    
    /**
     * Constructs a session class instance.
     */
    protected function __construct()
    {
        // Start the session.
        if (!isset($_SESSION))
        {
            session_start();
        }
        
        // Get prefix
        $this->prefix = Configuration::getInstance()->getString('session-prefix');
    }
    
    /**
     * Sets a session variable.
     *
     * @param  $name   Name of the variable.
     * @param  $value  Value of the variable.
     */
    public function setVar($name, $value)
    {
        $_SESSION[$this->prefix . '_' . $name] = $value;
    }
    
    /**
     * Unsets a session variable.
     *
     * @param  $name   Name of the variable.
     */
    public function unsetVar($name)
    {
        unset($_SESSION[$this->prefix . '_' . $name]);
    }
    
    /**
     * Sets a session variable.
     *
     * @param  $name   Name of the variable.
     *
     * @return  The value of the variable or the empty string if it does not exist.
     */
    public function getVar($name)
    {
        return isset($_SESSION[$this->prefix . '_' . $name]) ?
            $_SESSION[$this->prefix . '_' . $name] : '';
    }
    
    /**
     * Checks whether a variable exists in the session.
     *
     * @param  $name   Name of the variable.
     *
     * @return  Whether the variable exists.
     */
    public function exists($name)
    {
        return isset($_SESSION[$this->prefix . '_' . $name]);
    }
}
