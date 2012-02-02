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

require_once 'framework/database/assocentity.php';

/**
 * Class representing a note entity.
 */
class Note extends AssociativeEntity
{
    /** Id of the user who made the notes. */
    protected $userId;
    
    /** Text inside the note. */
    protected $text;
    
    /**
    * Constructs a note by user id.
    *
    * @param  $id  Id of the user. Default (null) will create a new note.
    */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->userId = $id;
            
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
        return 'Notes';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('userId');
    }
    
   /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('text');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'userId' => 'int',
            'text'   => 'string'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getUserId()        { return $this->userId;    }
    public function setUserId($userId) { $this->userId = $userId; }
    
    public function getText()      { return $this->text;  }
    public function setText($text) { $this->text = $text; }
}
