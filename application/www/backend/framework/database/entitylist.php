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
require_once 'framework/database/entity.php';

/**
 * Abstract class for a list of database entities.
 */
abstract class EntityList implements IteratorAggregate
{
    protected $entities;
    
    /**
     * Constructs an entity list.
     */
    public function __construct()
    {
        $this->entities = array();
    }
    
    /*
     * List manipulating.
     */
    
    /**
     * Adds an entity.
     *
     * @param $entity  Entity to add.
     */
    public function add($entity)
    {
        $entity->setMarkedAsUpdated(true);
        $this->entities[] = $entity;
    }
    
    /**
     * Removes an entity.
     *
     * @param $entity  Entity to remove.
     */
    public function remove($entity)
    {
        $key = array_search($this->entities, $entity);
        if ($key !== false)
        {
            unset($this->entities[$key]);
        }
    }
    
    /**
     * Removes an entity at an index.
     *
     * @param $index  Index of entity to remove.
     */
    public function removeAt($index)
    {
        unset($this->entities[$index]);
    }
    
    /**
     * Fetches an entity by index.
     * 
     * @param $index
     *
     * @return Entity at index.
     */
    public function get($index)
    {
        return $this->entities[$index];
    }
    
    /**
     * Tries to fetch an entity by index.
     * 
     * @param $index
     *
     * @return Entity at index or null if not found.
     */
    public function tryGet($index)
    {
        return isset($this->entities[$index]) ? $this->entities[$index] : null;
    }
    
    /**
     * Gets an iterator of this list.
     *
     * @return Entity list iterator.
     */
    public function getIterator()
    {
        return new ArrayIterator($this->entities);
    }
    
    /*
     * Manipulating and fetching from database.
     */
    
    /**
     * Finds entities.
     *
     * @param $conditions  Column-value pairs of equal conditions the list should satisfy.
     *                     case insensitive strings will be compared Case insensitively.
     * @param $offset      Offset to start list at.
     * @param $limit       Amount of entities to return. Pass null for no limit.
     * @param $ordering    Column-direction pairs of ordering.
     * @param $total       Will contain the total number of records, without the limit or offset
     *                     contraint.
     *
     * @return  Entity list with entities that pass the given criteria.
     */
    public static function find($conditions = array(), $offset = 0, $limit = null, $ordering = array(),
        &$total = null, $forUpdate = null)
    {
        // Get some values.
        $keys      = self::getPrimaryKeys();
        $tableName = self::getTableName();
        $types     = self::getTypes();
        
        // Build up conditions.
        $whereValues = $whereTypes = $whereConds = array();
        foreach ($conditions as $column => $value)
        {
            if (isset($types[$column]) && ($types[$column] == 'string'))
            {
                $whereConds[] = $tableName . '.' . $column . ' = :' . $column . ' COLLATE utf8_bin';
            }
            else
            {
                $whereConds[] = $tableName . '.' . $column . ' = :' . $column;
            }
            
            $whereValues[$column] = $value;
            $whereTypes[$column]  = isset($types[$column]) ? $types[$column] : 'string';
        }
        
        // Fetch total.
        if ($total !== null)
        {
            $total = Query::select()->
                count('*', 'total')->
                from(self::getTableName())->
                where($whereConds)->
                execute($whereValues, $whereTypes)->
                getFirstRow()->
                getValue('total', 'int');
        }
        
        // Build select clause.
        $query = static::buildSelectionQuery($forUpdate)->
            where($whereConds)->
            orderBy($ordering)->
            limit($limit, $offset);
        
        // Execute query.
        $resultSet = $query->execute($whereValues, $whereTypes);
        
        // Get types.
        $entityListType = get_called_class();
        $entityType     = static::getType();
        
        // Create entity list.
        $list = new $entityListType();
        
        // Add entities.
        foreach ($resultSet as $row)
        {
            // Fetch values.
            $values = $row->getValues($types);
            
            // Create entity.
            $entity = new $entityType();
            $entity->setRawValues($values);
            
            // Add entity.
            $list->add($entity);
            
            $entity->setMarkedAsUpdated(false);
        }
        
        return $list;
    }
    
    /**
     * Convenience alias for find() with $forUpdate = true.
     */
    public static function findForUpdate($conditions = array(), $offset = 0, $limit = null, $ordering = array(),
        &$total = null)
    {
        return self::find($conditions, $offset, $limit, $ordering, $total, true);
    }
    
    /**
     * Returns the query to select fields of this entity type.
     */
    protected static function buildSelectionQuery($forUpdate) 
    {
        $query = $forUpdate === true ? Query::selectForUpdate() : Query::select();
        return $query->
            from(self::getTableName());
    }
    
    /**
     * Loads entities.
     */
    public function load($keyValues) 
    {
        //$this->entities = self::find($keyValues);
    }
    
    /**
     * Saves all entities to the database.
     */
    public function save()
    {
        $entities = $this->entities;
        Database::getInstance()->doTransaction(
            function() use ($entities)
            {
                foreach ($entities as $entity)
                {
                    if ($entity->getMarkedAsDeleted())
                    {
                        $entity->delete();
                    } 
                    else if ($entity->getMarkedAsUpdated())
                    {
                        $entity->saveWithDetails();
                    }
                }
            }
        );
    }
    
    /**
     * Marks all entities as deleted.
     */
    public function markAllAsDeleted($marked)
    {
        foreach ($this->entities as $entity)
        {
            $entity->setMarkedAsDeleted($marked);
        }
    }
    
    /**
     * Marks all entities as updated.
     */
    public function markAllAsUpdated($marked)
    {
        foreach ($this->entities as $entity)
        {
            $entity->setMarkedAsUpdated($marked);
        }
    }
    
    /**
     * Deletes all entities from the database.
     */
    public function delete()
    {
        $entities = $this->entities;
        Database::getInstance()->doTransaction(
            function() use ($entities)
            {
                foreach ($entities as $entity)
                {
                    $entity->delete();
                }
            }
        );
    }
    
    /**
     * Gets the total amount of entities in database.
     */
    public static function getTotal()
    {
        return Query::select()->
            count('*', 'total')->
            from(self::getTableName())->
            execute()->
            getFirstRow()->
            getValue('total', 'int');
    }
    
    /*
     * Manipulating and fetching values.
     */
    
    /**
     * Sets a value to all these entities.
     *
     * @param  $name   Name of the value.
     * @param  $value  Its value.
     */
    public function setValue($name, $value)
    {
        foreach ($this->entities as $entity) 
        {
            $entity->setValues(array($name => $value));
        }
    }
    
    /**
     * Sets some values to all these entities.
     *
     * @param  $values  Array of name-value pairs to set.
     */
    public function setValues($values)
    {
        foreach ($this->entities as $entity) 
        {
            $entity->setValues($values);
        }
    }
    
    
    /**
    * Gets an entity by a key value combination.
    *
    * @param  $key  Name of the value.
    * @param  $value Value.
    * 
    * @return  Array of values.
    */
    public function getByKeyValue($key, $value)
    {
        foreach ($this->entities as $entity)
        {
            $values = $entity->getValues(array($key));
            if ($values[$key] === $value)
            {
                return $entity; 
            }
        }
    
        return null;
    }
    
    
    /**
     * Gets a value of all these entities.
     *
     * @param  $name  Name of the value.
     *
     * @return  Array of values.
     */
    public function getValue($name)
    {
        $result = array();
        foreach ($this->entities as $entity) 
        {
            $values = $entity->getValues(array($name));
            $result[] = $values[$name];
        }
        
        return $result;
    }
    
    /**
     * Gets some values of all these entities.
     *
     * @param  $names  Array of names to get.
     *
     * @return  Array of array with key value pairs.
     */
    public function getValues($names)
    {
        $result = array();
        foreach ($this->entities as $entity) 
        {
            $result[] = $entity->getValues($names);
        }
        
        return $result;
    }
    
    /**
     * Returns the entities.
     *
     * @return  Array of models.
     */
    public function getEntities()
    {
        return $this->entities;
    }
    
    /*
     * Helper static functions.
     */
    
    /**
     * Gets all types of this entity list.
     *
     * @return  All types of this entity list, by column name.
     */
    public static function getTypes($default = true)
    {
        $type = static::getType();
        return $type::getTypes($default);
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        $type = static::getType();
        return $type::getTableName();
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        $type = static::getType();
        return $type::getPrimaryKeys();
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        $type = static::getType();
        return $type::getColumns();
    }
    
    /**
     * Gets the type of the entity of this entitiy list.
     *
     * @return  Type of the entity.
     */
    public static function getType()
    {
        return substr(get_called_class(), 0, -4); // Remove 'List'.
    }
}
