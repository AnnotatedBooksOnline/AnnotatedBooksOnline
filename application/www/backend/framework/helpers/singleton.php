<?php
//[[GPL]]

// Exceptions
class SingletonException extends ExceptionBase { }

/**
 * Base class for all singleton classes.
 */
abstract class Singleton
{
    private static $instance;

    private function __construct()
    {
    }

    /**
     * Gets the unique singleton instance.
     *
     * @return  The unique instance of the subclass.
     */
    public static function getInstance()
    {
        if (!isset(self::$instance))
        {
            $className = get_called_class();
            self::$instance = new $className;
        }
        
        return self::$instance;
    }

    public function __clone()
    {
        throw new SingletonException('cloning-singleton');
    }

    public function __wakeup()
    {
        throw new SingletonException('deserializing-singleton');
    }
}
