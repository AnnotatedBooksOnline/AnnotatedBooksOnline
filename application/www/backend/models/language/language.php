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
 * Class representing a language.
 */
class Language extends Entity
{
    /** The identifier of a language. */
    protected $languageId;
    
    /** The name of the language. */
    protected $languageName;
    
    /**
     * Constructs a language entity.
     *
     * @param $id  Id of the language. Default (null) will create a new one.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->languageId = $id;
            
            $this->load();
        }
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'Languages';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('languageId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('languageName');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'languageId'   => 'int',
            'languageName' => 'string'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getLanguageId()    { return $this->languageId; }
    public function setLanguageId($id) { $this->languageId = $id;  }
    
    public function getLanguageName()      { return $this->languageName;  }
    public function setLanguageName($name) { $this->languageName = $name; }
}

