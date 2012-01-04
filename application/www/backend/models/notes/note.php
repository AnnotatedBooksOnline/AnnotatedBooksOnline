<?php
//[[GPL]]
//Note: NoteId is disabled temporarily. We will make use of this parameter, when multiple notes are implemented.
require_once 'framework/database/entity.php';
/**
 * Class representing a note entity.
 */
class Note extends Entity
{
    /** Id of the notes. */
    //protected $noteId;
    
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
            //$this->noteId= &id;
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
        return array(/*noteId*/'userId');
    }
           
   /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array(/*'userId',*/ 'text');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                    //'noteId'           => 'int',
                    'userId'           => 'int',
                    'text'            => 'string'
        );
    }
    
    //public function getNoteId()         { return $this->noteId; }
    //public function setNoteId($noteId)  { $this->noteId = $noteId; }
    
    public function getUserId()         { return $this->userId; }
    public function setUserId($userId)  { $this->userId = $userId; }
    
    public function getText()           { return $this->text; }
    public function setText($text)      { $this->text = $text; }
    
}
