<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a author entity. Associatieve between book and person.
 */
class Author extends Entity
{
    
    /** Person. */
    protected $authorId;
    
    /** Book. */
    protected $bookId;
   
    
    /**
     * Constructs an author by id.
     *
     * @param  $id  Id of the author. Default (null) will create a new author.
     */
    public function __construct($authorId = null, $bookId = null)
    {
        if ($id !== null)
        {
            $this->bookId = $bookId;
            $this->authorId = $authorId;
            $this->load();
        }
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
        return array('authorId', 'bookId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('authorId', 'bookId');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                    'authorId'         => 'int',
                    'bookId'           => 'int'
        );
    }
    
    public function getBookId()         { return $this->bookId; }
    public function setBookId($bookId)     { $this->bookId = $bookId; }
    
    public function getAuthorId() { return $this->authorId; }
    public function setAuthorId($authorId) { $this->authorId = $authorId; }

}
