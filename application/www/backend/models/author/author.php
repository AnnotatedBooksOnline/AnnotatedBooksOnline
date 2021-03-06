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
require_once 'framework/database/database.php';
require_once 'models/author/authorlist.php';

/**
 * Class representing a author entity. Associatieve between book and person.
 */
class Author extends AssociativeEntity
{
    /** Person id. */
    protected $personId;
    
    /** Book id. */
    protected $bookId;
   
    /**
     * Constructs an author entity by a person and book id.
     *
     * @param $personId
     * @param $bookId
     * @param $createNew  If true, a new author will be created if the specified one did not 
     *                    exist yet. If one already exists, it doesn't really matter whether 
     *                    this is true or false.
     */
    public function __construct($personId = null, $bookId = null, $createNew = false)
    {
        if (($personId !== null) && ($bookId !== null))
        {
            $this->bookId   = $bookId;
            $this->personId = $personId;
            
            if ($createNew)
            {
                $this->save();
            }
            else
            {
                $this->load();
            }
        }
    }
    
    /**
     * Returns all the authors which belong to one book
     *
     * @param $book  The book model
     * @return  Array of author models
     */
    public static function fromBook($book)
    {
        $authors = AuthorList::find(array('bookId' => $book->getBookId()))->getEntities();
        return $authors;
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Authors';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('personId', 'bookId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array();
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
            'bookId'   => 'int'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getBookId()        { return $this->bookId;    }
    public function setBookId($bookId) { $this->bookId = $bookId; }
    
    public function getPersonId()          { return $this->personId;      }
    public function setPersonId($personId) { $this->personId = $personId; }
}
