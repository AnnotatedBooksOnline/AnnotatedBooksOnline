<?php 
/*
* This program is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; version 3 of the License.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* Copyright: Bert Massop, Gerben van Veenendaal, Iris Bekker, Jeroen Hanselman,
* Maarten van Duren, Renze Droog, Robin van der Ploeg, Tom Tervoort,
* Tom Wennink, Mathijs Baaijens.
*/


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
