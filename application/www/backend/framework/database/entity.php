<?php
//[[GPL]]

require_once 'framework/database/database.php';

// Exceptions.
class EntityException extends ExceptionBase { }

/**
 * Abstract class for any database entity.
 */
abstract class Entity
{
    /** Timestamp when this entity was created. */
    private $tsCreated;
    
    /** Timestamp when this entity was last changed. */
    private $tsChanged;
    
    /** Identifier of the user who has created this entity. */
    private $userCreated;
    
    /** Identifier of the user who has last changed this entity. */
    private $userChanged;
    
    /**
     * Loads this entity.
     */
    protected function load()
    {
        // Determine if the primary keys are filled.
        if (!$this->arePrimaryKeysFilled())
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // Create the SQL statement to retrieve this entity and execute it prepared.
        $query = $this->getSelectQuery();
        
        $resultSet = Database::getInstance()->executePreparedStatement($query,
            $this->getPrimaryKeyValues());
        
        // Determine if the entity was found in the database.
        if ($resultSet->getCount() != 1) 
        {
            throw new EntityException('entity-record-not-found');
        }
        
        // Store result in our members.
        foreach ($resultSet->getFirstResultRow()->getValues() as $name => $value)
        {
            $this->{$name} = $value;
        }
    }
    
    /**
     * Saves the entity to the database. A database row is inserted if the entity does not exist
     * in the database yet. A database row is updated if the entity exists in the database.
     */
    public function save()
    {
        // Initialize the database connection and start a transaction
        Database::getInstance()->startTransaction();
        
        // Determine if this is a fresh entity which has to be inserted into the database.
        if (!$this->isPrimaryKeyFilled())
        {
            // Get the SQL statement to insert this entity and execute the statement prepared.
            $query = $this->getInsertQuery();
            
            Database::getInstance()->executePreparedStatement($query, $this->getValues());
        }
        else
        {
            // Get the SQL statement to update this entity and execute the statement prepared.
            $query = $this->getUpdateQuery();
            
            Database::getInstance()->executePreparedStatement($query, $this->getValues());
        }
        
        // Commit the database transaction.
        Database::getInstance()->commit();
        
        
        //TODO: get primary keys and set them..
        
    }
    
    /**
     * Sets some values of this entity.
     *
     * @param  $values  Array of name-value pairs to set.
     */
    public function setValues($values)
    {
        foreach ($values as $name => $value)
        {
            $this->{'set' . ucfirst($name)}($value);
        }
    }
    
    /**
     * Gets all values of this entity.
     *
     * @return  All values of this entity.
     */
    public function getValues($keys = true, $default = true)
    {
        $columns = array_merge(
            $keys ? $this->getPrimaryKeys() : array(),
            $this->getColumns(),
            $default ? $this->getDefaultColumns() : array()
        );
        
        $values = array();
        foreach ($columns as $key)
        {
            $values[$key] = $this->{$key};
        }
        
        return $values;
    }
    
    /**
     * Gets all primary key values of this entity.
     *
     * @return  All primary key values of this entity.
     */
    public function getPrimaryKeyValues()
    {
        $values = array();
        foreach ($this->getPrimaryKeys() as $key)
        {
            $values[$key] = $this->{$key};
        }
        
        return $values;
    }
    
    /**
     * Checks if all primary keys are filled.
     *
     * @return  Whether the primary keys are filled.
     */
    protected function arePrimaryKeysFilled()
    {
        foreach ($this->getPrimaryKeys() as $key)
        {
            if (!isset($this->{$key}))
            {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Gets columns that are available in all entities.
     *
     * @return  Query to select an entity from the database.
     */
    protected function getDefaultColumns()
    {
        return array('tsCreated', 'tsChanged', 'userCreated', 'userChanged');
    }
    
    /**
     * Returns the query needed to select this entity from the database.
     *
     * @return  Query to select an entity from the database.
     */
    protected function getSelectQuery()
    {
        // Get keys and table name.
        $keys      = $this->getPrimaryKeys();
        $tableName = $this->getTableName();
        
        // Set the where clause of the query.
        $callback = function($value)
        {
            return $value . ' = :' . $this->{$value};
        };

        $whereClause = implode(' AND ', array_map($callback, $keys));
        
        // Create query.
        $query = 'SELECT * FROM ' . $tableName . ' WHERE ' . $whereClause;
        
        return $query;
    }
    
    /**
     * Returns the query needed to insert this entity into the database.
     *
     * @return  Query to insert this entity in the database.
     */
    protected function getInsertQuery()
    {
        // Get columns and table name.
        $columns   = array_merge($this->getColumns(), $this->getDefaultColumns());
        $tableName = $this->getTableName();
        
        // Create values.
        $values = ':' . implode(', :', $columns);
        
        // Create query.
        $query = 'INSERT INTO ' . $tableName
               . '(' . implode(', ', $columns) . ') VALUES '
               . '(' . $values . ')';
        
        return $query;
    }
    
    /**
     * Returns the query needed to delete this entity from the database.
     *
     * @return  Query to delete this entity from the database.
     */
    protected function getDeleteQuery()
    {
        // Get keys and table name.
        $keys      = $this->getPrimaryKeys();
        $tableName = $this->getTableName();
        
        // Set the where clause of the query.
        $callback = function($value)
        {
            return $value . ' = :' . $value;
        };

        $whereClause = implode(' AND ', array_map($callback, $keys));
        
        // Create query.
        $query = 'DELETE FROM ' . $tableName . ' WHERE ' . $whereClause;
        
        return $query;
    }
    
    /**
     * Returns the query needed to update this entity in the database.
     *
     * @return  Query to update this entity in the database.
     */
    protected function getUpdateQuery()
    {
        // Get columns and table name.
        $keys      = $this->getPrimaryKeys();
        $columns   = array_merge($this->getColumns(), $this->getDefaultColumns());
        $tableName = $this->getTableName();
        
        // Set the set clause of the query.
        $callback = function($value)
        {
            return $value . ' = :' . $value;
        };

        $setClause = implode(', ', array_map($callback, $columns));
        
        // Set the where clause of the query.
        $callback = function($value)
        {
            return $value . ' = :' . $value;
        };

        $whereClause = implode(' AND ', array_map($callback, $keys));
        
        // Create query.
        $query  = 'UPDATE ' . $tableName . ' SET ' . $setClause . ' WHERE ' . $whereClause;
        
        return $query;
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    abstract protected function getTableName();
    
    /**
     * Gets the primary key.
     *
     * @return  Array of all primary keys.
     */
    abstract protected function getPrimaryKeys();
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    abstract protected function getColumns();
}
