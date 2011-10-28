<?php

require_once 'framework/database/database.php';

/**
 * Abstract class for any database entity.
 */
abstract class Entity
{
    /** Timestamp when this entity was created */
    private $tsCreated;
    
    /** Timestamp when this entity was last changed. */
    private $tsChanged;
    
    /** Identifier of the user who has created this entity. */
    private $userCreated;
    
    /** Identifier of the user who has last changed this entity. */
    private $userChanged;
    
    /**
     * 
     * Enter description here ...
     */
    public function retrieve()
    {
        if (!$this->determineIsPrimaryKeyFilled()) {
            // TODO : Throw exception;
            return;
        }
        $query = makeSelectSql();
        $resultSet = DBConnection::getInstance()->executePreparedStatement($query, $this->moveInstanceVarsToAttributes());
        
        if ($resultSet->getCount() != 1) {
            // TODO : Thow exception.
            return;
        }
        
        $this->moveAttributesToInstanceVars($resultSet->getFirstResultRow());
    }
    
    /**
      * 
      * Enter description here ...
      */
    public function retrieveWithDetails()
    {
        $this->retrieve();
        $this->retrieveDetails();
    }
    
    /**
     *
     * Implement in derived class to retrieve attribute (and associactive?) entities.
     */
    abstract public function retrieveDetails();
    
    /**
     * Saves the entity to the database. A database row is inserted if the entity does not exist in the
     * database yet. A database row is updated if the entity exists in the database.
     */
    public function save()
    {
        // Determine if this is a fresh entity which has to be inserted into the database.
        if (!$this->determineIsPrimaryKeyFilled())
        {
            // Insert the entity into the database.
            $query = $this->makeInsertSql();
            DBConnection::getInstance()->executePreparedStatement($query, $this->moveInstanceVarsToAttributes());
        }
        else
        {
            $query = $this->makeUpdateSql();
            DBConnection::getInstance()->executePreparedStatement($query, $this->moveInstanceVarsToAttributes());
        }
    }
    
    /**
     *
     * Enter description here ...
     */
    public function saveWithDetails()
    {
        $this->save();
        $this->saveDetails();
    }
    
    /**
     * 
     * Enter description here ...
     */
    abstract public function saveDetails();
    
    
    /**
     * Moves the class instance variables into an array for insertion into a query.
     */
    abstract protected function moveInstanceVarsToAttributes();
    
    /**
     * Moves the result attributes from a query into this classes instance variables.
     * @param resultSetRow Result set row to read the attributes from.
     */
    abstract protected function moveAttributesToInstanceVars($resultSetRow);
    
    /**
    * This method returns the SQL needed to select this entity from the database.
    * @return SQL code to select this entity in the database.
    */
    abstract protected function makeSelectSql();
    
    /**
     * This method returns the SQL needed to insert this entity into the database.
     * @return SQL code to insert this entity in the database.
     */
    abstract protected function makeInsertSql();
    
    /**
     * This method returns the SQL needed to delete this entity from the database.
     * @return SQL code to delete this entity from the database.
     */
    abstract protected function makeDeleteSql();
    
    /**
     * This method returns the SQL needed to update this entity in the database.
     * @return SQL code to update this entity in the database.
     */
    abstract protected function makeUpdateSql();
    
    /**
     * This method determines if the primary key instance variables of this object are filled.
	 * @return <code>true</code> if the primary key is filled, otherwise <code>false</code>.
     */
    abstract protected function determineIsPrimaryKeyFilled();
   
}
