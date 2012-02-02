<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/util/exceptionbase.php';

// Exceptions
class SingletonException extends ExceptionBase { }

/**
 * Base class for all singleton classes.
 */
abstract class Singleton
{
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
        if (!isset(static::$instance))
        {
            $className = get_called_class();
            static::$instance = new $className;
        }
        
        return static::$instance;
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
