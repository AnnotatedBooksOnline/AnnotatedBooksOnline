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

require_once 'framework/database/entity.php';

/**
 * Class representing a person entity.
 */
class Person extends Entity
{
    /** Person id. */
    protected $personId;
    
    /** Full name of the person. */
    protected $name;
    
    /**
     * Constructs a person by id.
     *
     * @param  $id  Id of the person. Default (null) will create a new person.
     */
    public function __construct($personId = null)
    {
        if ($personId !== null)
        {
            $this->personId = $personId;
            
            $this->load();
        }
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Persons';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('personId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('name');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'personId' => 'int',
            'name'     => 'istring'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getPersonId()          { return $this->personId;      }
    public function setPersonId($personId) { $this->personId = $personId; }
    
    public function getName()      { return $this->name;  }
    public function setName($name) { $this->name = $name; }
}
