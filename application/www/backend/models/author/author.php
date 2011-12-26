<?php 
//[[GPL]]

require_once 'framework/database/assocentity.php';
require_once 'framework/database/database.php';

/**
 * Class representing a author entity. Associatieve between book and person.
 */
class Author extends AssociativeEntity
{
    
    /** Person. */
    protected $personId;
    
    /** Book. */
    protected $bookId;
   
    
    /**
     * Constructs an author entity by a person and book id.
     *
     * @param id   $personId
     * @param id   $bookId
     * @param bool $createnew If true, a new author will be created if the specified one did not 
     *                        exist yet. If one already exists, it doesn't really matter whether 
     *                        this is true or false.
     */
    public function __construct($personId = null, $bookId = null, $createnew = false)
    {
        if ($personId !== null && $bookId !== null)
        {
            $this->bookId = $bookId;
            $this->personId = $personId;
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
    
    public static function fromBook($book)
    {
        $result = Query::select('personId', 'bookId')
            ->from('Authors')
            ->where('bookId = :book')
            ->execute(array(':book' => $book->getBookId()));
            
        $authors = array();
        
        foreach($result as $author)
        {
            $authors[] = new Author($author->getValue('personId'), $author->getValue('bookId'), true);
        }
        return $authors;
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected function getTableName()
    {
        return 'Authors';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('personId', 'bookId');
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
                    'personId'         => 'int',
                    'bookId'           => 'int'
        );
    }
    
    public function getBookId()         { return $this->bookId; }
    public function setBookId($bookId)     { $this->bookId = $bookId; }
    
    public function getPersonId() { return $this->personId; }
    public function setPersonId($personId) { $this->personId = $personId; }

}
