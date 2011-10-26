<?php 

require_once 'framework/helpers/singleton.php';

/**
 * Represents the current user session.
 */
class Session extends Singleton
{
    /**
     * Constructs a session class instance.
     */
    protected function __construct()
    {
        //start the session
        session_start();
    }
    
    /**
     * Gets the session singleton instance.
     *
     * @return  The unique instance of the session.
     */
    public static function getInstance()
    {
        return parent::getInstance(__CLASS__);
    }
    
    /**
     * Sets a session variable.
     *
     * @param  $name   Name of the variable.
     * @param  $value  Value of the variable.
     */
    public function setVar($name, $value)
    {
        $_SESSION['application_' . $name] = $value;
    }
    
    /**
     * Unsets a session variable.
     *
     * @param  $name   Name of the variable.
     */
    public function unsetVar($name)
    {
        unset($_SESSION['application_' . $name]);
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
        return isset($_SESSION['application_' . $name]) ? $_SESSION['application_' . $name] : '';
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
        return isset($_SESSION['application_' . $name]);
    }
}
