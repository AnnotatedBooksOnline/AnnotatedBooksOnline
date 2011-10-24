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
