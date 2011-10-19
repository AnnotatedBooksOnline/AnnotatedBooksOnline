<?php

/**
 * Base class for all singleton classes.
 */
class Singleton
{
    private static $instance;

    private function __construct()
    {
    }

    /**
     * Gets the subclass its singleton instance.
     *
     * @param  $className   Name of the subclass to create an instance of.
     *
     * @return  The unique instance of the subclass.
     */
    protected static function getInstance($className)
    {
        if (!isset(self::$instance))
        {
            self::$instance = new $className;
        }
        
        return self::$instance;
    }

    public function __clone()
    {
        throw new Exception('Cloning a singleton class is not allowed.');
    }

    public function __wakeup()
    {
        throw new Exception('Deserializing a singleton class is not allowed.');
    }
}
