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
    private $createdOn;
    
    /** Timestamp when this entity was last changed. */
    private $changedOn;
    
    /** Identifier of the user who has created this entity. */
    private $createdBy;
    
    /** Identifier of the user who has last changed this entity. */
    private $changedBy;
    
    /**
     * Loads this entity.
     */
    public function load()
    {
        // Determine if the primary keys are filled.
        if (!$this->arePrimaryKeysFilled())
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // Create the SQL statement to retrieve this entity and execute it prepared.
        $resultSet = $this->getSelectQuery()->execute($this->getPrimaryKeyValues());
        
        // Determine if the entity was found in the database.
        if ($resultSet->getAmount() != 1)
        {
            throw new EntityException('entity-record-not-found');
        }
        
        // Store result in our members.
        $values = $resultSet->getFirstRow()->getValues($this->getTypes());
        foreach ($values as $name => $value)
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
        // Determine if this is a fresh entity which has to be inserted into the database.
        if (!$this->arePrimaryKeysFilled())
        {
            // TODO: Set default columns.
            
            // Get values and types.
            $values = $this->getValues(false);
            $types  = $this->getTypes();
            
            // Get the SQL statement to insert this entity and execute the statement .
            $row = $this->getInsertQuery(true)->execute($values, $types)->getFirstRow();
            
            // Acquire the primary keys.
            $keyValues = $row->getValues($types);
            foreach ($keyValues as $key => $value)
            {
                $this->{$key} = $value;
            }
        }
        else
        {
            // Get values and types.
            $values = $this->getValues();
            $types  = $this->getTypes();
            
            // Get the SQL statement to update this entity and execute the statement prepared.
            $this->getUpdateQuery()->execute($values, $types);
        }
    }    
    
    /**
     *
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
    public function saveDetails()
    {
        ;
    }
    
    /**
     * Deletes the entity from the database.
     */
    public function delete()
    {
        // Determine if the primary keys are filled.
        if (!$this->arePrimaryKeysFilled())
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // Delete entity.
        $this->getDeleteQuery()->execute($this->getPrimaryKeyValues());
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
            // Tom: I changed this because the previous solution was more error-prone.
            // Now you do have to manually use the setPassword function when you want to set a 
            // password rather than a password hash, but this prevents problems with setters that
            // have are not present or have been inconsistantly named.
            //$this->{$name} = $value;
            
            // Gerben: If a setter does not exist, an error should be thrown.
            // Setters really should be used here, as we want checking of the values.
            // Also, they should be consistently named.
            
            // Get function name.
            $functionName = 'set' . ucfirst($name);
            
            // Check if it exists, and call it.
            if (method_exists($this, $functionName))
            {
                $this->{$functionName}($value);
            }
            else
            {
                throw new EntityException('entity-column-cannot-be-set', $name);
            }
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
    
    protected function getTypes($default = true)
    {
        $types = $this->getColumnTypes();
        if ($default)
        {
            $defaultTypes = $this->getDefaultColumnTypes();
            if ($defaultTypes !== null)
            {
                return ($types === null) ? $defaultTypes : array_merge($types, $defaultTypes);
            }
        }
        
        return $types;
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
        return array('createdOn', 'changedOn', 'createdBy', 'changedBy');
    }
    
    /**
     * Gets all the default column types, per column.
     *
     * @return  Array of all default column types.
     */
    protected function getDefaultColumnTypes()
    {
        return array(
            'createdOn' => 'timestamp',
            'changedOn' => 'timestamp',
            'createdBy' => 'string',
            'changedBy' => 'string'
        );
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     * 
     * Note: the type istring denotes a string that should be compared in a case insensitive manner.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return null;
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
        $types = $this->getTypes();
        
        // Set the conditions of the query.
        $callback = function($value) use ($types)
        {
            if(isset($types[$value]) && $types[$value] == 'istring')
            {
                // Do a case-insensitive comparision for istrings.
                return $value . 'ILIKE :' . $value;
            }
            else
            {
                return $value . ' = :' . $value;
            }
        };

        $conditions = array_map($callback, $keys);
        
        // Create query.
        return Query::select()->from($tableName)->where($conditions);
    }
    
    /**
     * Returns the query needed to insert this entity into the database.
     * 
     * @param $returning If true, a returning clause is added to the query which returns all
     *                   primary keys.
     *
     * @return  Query to insert this entity in the database.
     */
    protected function getInsertQuery($returning = false)
    {
        // Get columns and table name.
        $columns   = array_merge($this->getColumns(), $this->getDefaultColumns());
        $tableName = $this->getTableName();
        
        // Create values.
        $callback = function($value)
        {
            return ':' . $value;
        };

        $values = array_map($callback, $columns);
        
        // Create query.
        $query = Query::insert($tableName, array_combine($columns, $values));
        
        // Add returning statement.
        if ($returning)
        {
            foreach ($this->getPrimaryKeys() as $key)
            {
                if(!isset($this->{$key}))
                {
                    // It is assumed primary keys that are not included will be generated by the 
                    // database and can therefore be returned. 
                    $query->returning($key);
                }
            }
        }
        
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
        $types = $this->getTypes();
        
        // Set the conditions of the query.
        $callback = function($value) use ($types)
        {
            if(isset($types[$value]) && $types[$value] == 'istring')
            {
                // Do a case-insensitive comparision for istrings.
                return $value . 'ILIKE :' . $value;
            }
            else
            {
                return $value . ' = :' . $value;
            }
        };

        $conditions = array_map($callback, $keys);
        
        // Create query.
        return Query::delete($tableName)->where($conditions);
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
        $types = $this->getTypes();
        
        // Set the contents of the query.
        $callback = function($value)
        {
            return ':' . $value;
        };

        $values = array_map($callback, $columns);
        
        // Set the conditions of the query.
        $callback = function($value)
        {
            return $value . ' = :' . $value;
        };

        $conditions = array_map($callback, $keys);
        
        // Create query.
        return Query::update($tableName, array_combine($columns, $values))->where($conditions);
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected function getTableName()
    {
        throw new EntityException('entity-function-not-implemented');
    }
    
    /**
     * Gets the primary key.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        throw new EntityException('entity-function-not-implemented');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        throw new EntityException('entity-function-not-implemented');
    }
}

