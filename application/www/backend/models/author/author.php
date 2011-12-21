<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/database.php';

/**
 * Class representing a author entity. Associatieve between book and person.
 */
class Author extends Entity
{
    
    /** Person. */
    protected $personId;
    
    /** Book. */
    protected $bookId;
   
    
    /**
     * Constructs an author by id.
     *
     * @param  $id  Id of the author. Default (null) will create a new author.
     */
    public function __construct($personId = null, $bookId = null)
    {
        if ($personId !== null && $bookId !== null)
        {
            $this->bookId = $bookId;
            $this->personId = $personId;
            $this->load();
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
            $authors[] = new Author($author->getValue('personId'), $author->getValue('bookId'));
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
        return array('personId', 'bookId');
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
