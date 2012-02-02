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
 * Class representing a library entity.
 */
class Library extends Entity
{
    /** Id of this library. */
    protected $libraryId;
    
    /** Library name. */
    protected $libraryName;
    
    /** Library address */
    protected $libraryAddress;
    
    /** Library website. */
    protected $website;
    
    /** Info text about this library. */
    protected $info;
       
    /**
     * Constructs a library by id.
     *
     * @param  $id  Id of the library. Default (null) will create a new library.
     */
    public function __construct($libraryId = null)
    {
        if ($libraryId !== null)
        {
            $this->libraryId = $libraryId;
            
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
        return 'Libraries';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('libraryId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('libraryName', 'libraryAddress', 'website', 'info');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'libraryId'      => 'int',
            'libraryName'    => 'string',
            'libraryAddress' => 'string',
            'website'        => 'string',
            'info'           => 'string',
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getLibraryId()           { return $this->libraryId;       }
    public function setLibraryId($libraryId) { $this->libraryId = $libraryId; }
    
    public function getLibraryName()             { return $this->libraryName;         }
    public function setLibraryName($libraryName) { $this->libraryName = $libraryName; }
    
    public function getLibraryAddress()                { return $this->libraryAddress;           }
    public function setLibraryAddress($libraryAddress) { $this->libraryAddress = libraryAddress; }
    
    public function getWebsite()         { return $this->website;     }
    public function setWebsite($website) { $this->website = $website; }
    
    public function getInfo()      { return $this->info;  }
    public function setInfo($info) { $this->info = $info; }
}
