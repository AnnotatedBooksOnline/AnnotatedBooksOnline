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
require_once 'models/scan/scanlist.php';
require_once 'models/author/authorlist.php';
require_once 'models/language/booklanguagelist.php';
require_once 'models/binding/binding.php';
require_once 'models/book/booklist.php';

/**
 * Class representing a book entity.
 */
class Book extends Entity
{
    /** Id of this book. */
    protected $bookId;
    
    /** Title of this book. */
    protected $title;
    
    /** Binding identifier of the binding this book is part of. */
    protected $bindingId;
    
    /** Minimum year of publication. */
    protected $minYear;
    
    /** Maximum year of publication. */
    protected $maxYear;
    
    /** Precise date of publication. */
    protected $preciseDate;
    
    /** Place of publication. */
    protected $placePublished;
    
    /** Publisher of the book. */
    protected $publisher;
    
    /** Version of the book. */
    protected $printVersion;
    
    /** First page. */
    protected $firstPage;
    
    /** Last page. */
    protected $lastPage;
    
    /** Metadata. */
    protected $meta;
    
    /** list containing all the languages linked to this book. */
    protected $bookLanguageList;
    
    /** list containing all the authors of this book. */
    protected $authorList;
    
    /**
    * Constructs a book by id.
    *
    * @param  $id  Id of the book. Default (null) will create a new book.
    */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->bookId = $id;
            
            $this->load();
        }
        
        $this->authorList       = new AuthorList();
        $this->bookLanguageList = new BookLanguageList();
    }
    
    /**
     * Loads all the associated lists.
     */
    public function loadDetails()
    {
        $this->authorList = AuthorList::find(array('bookId' => $this->bookId));
        $this->bookLanguageList = BookLanguageList::find(array('bookId' => $this->bookId));
    }
    
    /**
     * Saves all the associated lists.
     */
    public function saveDetails() 
    {
        // Save the author list.
        $this->authorList->setValue('bookId', $this->bookId);
        $this->authorList->save();
        
        // Save the booklanguage list.
        $this->bookLanguageList->setValue('bookId', $this->bookId);
        $this->bookLanguageList->save();
    }
    
    /**
     * Returns all the books from one binding
     *
     * @param $binding  The binding model
     * @return  Array of book models
     */
    public static function fromBinding($binding)
    {
        $sorters = array('firstPage' => 'ASC');
        $books = BookList::find(
            array('bindingId' => $binding->getBindingId()), 0, null, $sorters)->getEntities();
        return $books;
    }
    
    /**
     * Returns all the books from one binding in a certain page range
     *
     * @param $book  The book model
     * @param $range  The page range
     * @return  Array of book models
     */
    public static function fromBindingPage($binding, $range)
    {
        if (is_array($range))
        {
            $from = $range[0];
            $to = $range[1];
        }
        else
        {
            $from = $range;
            $to = $range;
        }
        
        return Database::getInstance()->doTransaction(function() use ($binding, $from, $to)
        {
            $result = Query::select('bookId')
                ->from('Books')
                ->where('bindingId = :binding', 'lastPage >= :from', 'firstPage <= :to')
                ->orderBy('firstPage', 'ASC')
                ->execute(array(
                    'binding' => $binding->getBindingId(),
                    'from'    => $from,
                    'to'      => $to
                ));
            
            $books = array();
            foreach ($result as $book)
            {
                $books[] = new Book($book->getValue('bookId'));
            }
            
            return $books;
        });
    }
    
    /**
    * Gets the table name.
    *
    * @return  The table name.
    */
    public static function getTableName()
    {
        return 'Books';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('bookId');
    }
            
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('title', 'bindingId', 'minYear', 'maxYear',
                     'preciseDate', 'placePublished', 'publisher', 'printVersion',
                     'firstPage', 'lastPage', 'meta');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'bookId'         => 'int',
            'title'          => 'string',
            'bindingId'      => 'int',
            'minYear'        => 'int',
            'maxYear'        => 'int',
            'preciseDate'    => 'date',
            'placePublished' => 'string',
            'publisher'      => 'string',
            'printVersion'   => 'string',
            'firstPage'      => 'int',
            'lastPage'       => 'int',
            'meta'           => 'serialized'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getBookId()         { return $this->bookId;    }
    public function setBookId($bookId)  { $this->bookId = $bookId; }
    
    public function getTitle()       { return $this->title;   }
    public function setTitle($title) { $this->title = $title; }
    
    public function getBindingId()           { return $this->bindingId;       }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getMinYear()         { return $this->minYear;     }
    public function setMinYear($minYear) { $this->minYear = $minYear; }
    
    public function getMaxYear()         { return $this->maxYear;     }
    public function setMaxYear($maxYear) { $this->maxYear = $maxYear; }
    
    public function getPreciseDate()             { return $this->preciseDate;         }
    public function setPreciseDate($preciseDate) { $this->preciseDate = $preciseDate; }
    
    public function getPlacePublished()                { return $this->placePublished;            }
    public function setPlacePublished($placePublished) { $this->placePublished = $placePublished; }
    
    public function getPublisher()           { return $this->publisher;       }
    public function setPublisher($publisher) { $this->publisher = $publisher; }
    
    public function getPrintVersion()              { return $this->printVersion;          }
    public function setPrintVersion($printVersion) { $this->printVersion = $printVersion; }
    
    public function getFirstPage()      { return $this->firstPage;  }
    public function setFirstPage($page) { $this->firstPage = $page; }
    
    public function getLastPage()      { return $this->lastPage;  }
    public function setLastPage($page) { $this->lastPage = $page; }
    
    public function getAuthorList()            { return $this->authorList;        }
    public function setAuthorList($authorList) { $this->authorList = $authorList; }
    
    public function getBookLanguageList()                  { return $this->bookLanguageList;              }
    public function setBookLanguageList($bookLanguageList) { $this->bookLanguageList = $bookLanguageList; }
    
    public function getMeta()      { return is_array($this->meta) ? $this->meta : array(); }
    public function setMeta($meta) { $this->meta = $meta; }
}
