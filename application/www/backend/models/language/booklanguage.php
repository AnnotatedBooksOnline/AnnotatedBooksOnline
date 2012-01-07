<?php 
//[[GPL]]

require_once 'framework/database/assocentity.php';
require_once 'framework/database/database.php';

/**
 * Associative enity representing the language of a book.
 */
class BookLanguage extends AssociativeEntity
{
    /** Book. */
    protected $bookId;
    
    /** Language. */
    protected $languageId;
   
    
    /**
     * Constructs a book-language relation.
     *
     * @param id   $bookId
     * @param id   $languageId
     * @param bool $createnew If true, a new relation will be created if the specified one did not 
     *                        exist yet. If one already exists, it doesn't really matter whether 
     *                        this is true or false.
     */
    public function __construct($bookId = null, $languageId = null, $createnew = false)
    {
        if ($languageId !== null && $bookId !== null)
        {
            $this->bookId = $bookId;
            $this->languageId = $languageId;
            if($createnew)
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
     * Creates a new relation between a book and a language or retreives one if it already exists.
     * 
     * The id's of the book and the language should be set.
     *  
     * @param Book     $book
     * @param Language $language
     */
    public static function createOrGet($book, $language)
    {
        return new BookLanguage($book->getBookId(), $language->getLanguageId(), true);
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected function getTableName()
    {
        return 'BookLanguages';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('bookId', 'languageId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array();
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                    'bookId'           => 'int',
                    'languageId'       => 'int'
        );
    }
       
    // Getters and setters.
    
    public function getBookId()        { return $this->bookId;    }
    public function setBookId($bookId) { $this->bookId = $bookId; }
    
    public function getLanguageId()    { return $this->languageId; }
    public function setLanguageId($id) { $this->languageId = $id;  }
}
