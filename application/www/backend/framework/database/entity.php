<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/database/database.php';

/*
 * Exceptions.
 */
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
    
    /** Marks the entity for deletion in an entity list. */
    private $markedAsDeleted;
    
    /** Marks the entity for deletion in an entity list. */
    private $markedAsUpdated;
    
    /**
     * Loads this entity.
     */
    public function load()
    {
        // By default an entity is not marked for deletion or updating.
        $markedAsDeleted = false;
        $markedAsUpdated = false;
        
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
        $values = $resultSet->getFirstRow()->getValues(static::getTypes());
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
            $values = $this->getAllValues(false);
            $types  = static::getTypes();
            
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
            $values = $this->getAllValues();
            $types  = static::getTypes();
            
            // Get the SQL statement to update this entity and execute the statement prepared.
            $this->getUpdateQuery()->execute($values, $types);
        }
    }
    
    /**
     * Saves entity with its relations.
     */
    public function saveWithDetails()
    {
        $entity = $this;
        Database::getInstance()->doTransaction(
            function() use ($entity)
            {
                $entity->save();
                $entity->saveDetails();
            }
        );
    }
    
    /**
     * Saves entity its relations.
     */
    public function saveDetails()
    {
        // No details to save by default.
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
     * Sets raw values of this entity. Only for use by entity list!
     *
     * @param  $values  Array of name-value pairs to set.
     */
    public function setRawValues($values)
    {
        foreach ($values as $name => $value)
        {
            $this->{$name} = $value;
        }
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
     * Gets some values of this entity.
     *
     * @param  $values  Array of names to fetch, or null if you want to fetch everything.
     */
    public function getValues($columns = null)
    {
        // Handle case of all accessable values.
        $throwException = true;
        if ($columns === null)
        {
            $columns = array_merge(static::getPrimaryKeys(), static::getColumns());
            
            $throwException = false;
        }
        
        // Fetch all values.
        $result = array();
        foreach ($columns as $column)
        {            
            // Get function column.
            $functionName = 'get' . ucfirst($column);
            
            // Check if it exists, and call it.
            if (method_exists($this, $functionName))
            {
                $result[$column] = $this->{$functionName}();
            }
            else if ($throwException)
            {
                throw new EntityException('entity-column-cannot-be-fetched', $column);
            }
        }
        
        return $result;
    }
    
    /**
     * Gets all values of this entity.
     *
     * @return  All values of this entity.
     */
    protected function getAllValues($keys = true, $default = true)
    {
        $columns = array_merge(
            $keys ? static::getPrimaryKeys() : array(),
            static::getColumns(),
            $default ? static::getDefaultColumns() : array()
        );
        
        $values = array();
        foreach ($columns as $key)
        {
            $values[$key] = $this->{$key};
        }
        
        return $values;
    }
    
    /**
     * Gets all types of this entity.
     *
     * @return  All types of this entity, by column name.
     */
    public static function getTypes($default = true)
    {
        $types = static::getColumnTypes();
        if ($default)
        {
            $defaultTypes = static::getDefaultColumnTypes();
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
     * Returns the query needed to select this entity from the database.
     *
     * @return  Query to select an entity from the database.
     */
    protected function getSelectQuery()
    {
        // Get keys and table name.
        $keys      = static::getPrimaryKeys();
        $tableName = static::getTableName();
        $types     = static::getTypes();
        
        // Set the conditions of the query.
        $callback = function($value) use ($types)
        {
            if (isset($types[$value]) && ($types[$value] == 'istring'))
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
        $columns   = array_merge(static::getColumns(), static::getDefaultColumns());
        $tableName = static::getTableName();
        
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
                if (!isset($this->{$key}))
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
        $keys      = static::getPrimaryKeys();
        $tableName = static::getTableName();
        $types     = static::getTypes();
        
        // Set the conditions of the query.
        $callback = function($value) use ($types)
        {
            if (isset($types[$value]) && ($types[$value] == 'istring'))
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
        $keys      = static::getPrimaryKeys();
        $columns   = array_merge(static::getColumns(), static::getDefaultColumns());
        $tableName = static::getTableName();
        $types     = static::getTypes();
        
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
     * Gets columns that are available in all entities.
     *
     * @return  Query to select an entity from the database.
     */
    public static function getDefaultColumns()
    {
        return array('createdOn', 'changedOn', 'createdBy', 'changedBy');
    }
    
    /**
     * Gets all the default column types, per column.
     *
     * @return  Array of all default column types.
     */
    public static function getDefaultColumnTypes()
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
     * The istring type denotes a string that should be compared in a case insensitive manner.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return null;
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        throw new EntityException('entity-function-not-implemented');
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        throw new EntityException('entity-function-not-implemented');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        throw new EntityException('entity-function-not-implemented');
    }

    /**
     * Getters and setters.
     */
    
    public function getMarkedAsDeleted() { return $this->markedAsDeleted; }
    public function setMarkedAsDeleted($marked) { $this->markedAsDeleted = $marked; }
    
    public function getMarkedAsUpdated() { return $this->markedAsUpdated; }
    public function setMarkedAsUpdated($marked) { $this->markedAsUpdated = $marked; }
}
