<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a provenance entity. Associatieve between binding and person.
 */
class Author extends Entity
{
    
    /** Binding. */
    protected $bindingId;
    
    /** Person. */
    protected $personId;
   
    
    /**
     * Constructs an author by id.
     *
     * @param  $id  Id of the author. Default (null) will create a new author.
     */
    public function __construct($bindingId = null, $personId = null)
    {
        if ($id !== null)
        {
            $this->bindingId = $bookId;
            $this->personId = $personId;
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
        return array('bindingId', 'personId');
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
                    'bindingId'         => 'int',
                    'personId'          => 'int'
        );
    }
    
    public function getBindingId()               { return $this->bindingId; }
    public function setBindingId($bindingId)     { $this->bindingId = $bindingId; }
    
    public function getPersonId()             { return $this->personId; }
    public function setPersonId($personId)    { $this->personId = $personId; }

}
