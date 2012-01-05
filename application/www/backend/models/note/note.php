<?php
//[[GPL]]

require_once 'framework/database/assocentity.php';

/**
 * Class representing a note entity.
 */
class Note extends AssociativeEntity
{
    /** Id of the user who made the notes. */
    protected $userId;
    
    /** Text inside the note. */
    protected $text;
    
    /**
    * Constructs a note by noteId.
    *
    * @param  $id  Id of the user. Default (null) will create a new note.
    */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->userId = $id;
            
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
        return 'Notes';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    
    protected function getPrimaryKeys()
    {
        return array('userId');
    }
    
   /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('text');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'userId' => 'int',
            'text'   => 'string'
        );
    }
    
    public function getUserId()         { return $this->userId;    }
    public function setUserId($userId)  { $this->userId = $userId; }
    
    public function getText()           { return $this->text;  }
    public function setText($text)      { $this->text = $text; }
}
