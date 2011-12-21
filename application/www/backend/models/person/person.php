<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a person entity.
 */
class Person extends Entity
{

    /** Person id. */
    protected $personId;
    
    /** Full name of the person. */
    protected $name;
     
    
    /**
     * Constructs an person by id.
     *
     * @param  $id  Id of the person. Default (null) will create a new person.
     */
    public function __construct($personId = null)
    {
        if ($personId !== null)
        {
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
        return 'Persons';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('personId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('personId', 'name');
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
                        'name  '           => 'string'
        );
    }
    
    public function getPersonId()              { return $this->personId; }
    public function setPersonId($personId)     { $this->personId = $personId; }
    
    public function getName()                  { return $this->name; }
    public function setName($name)             { $this->name = $name; }
}
