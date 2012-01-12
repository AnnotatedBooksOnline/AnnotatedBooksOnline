<?php
//[[GPL]]

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
     * Tries to fetcg an entity by index.
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
     * Find entities.
     */
    public static function find($conditions = array(), $offset = 0, $limit = null, $ordering = array()) 
    {
        // Get some values.
        $keys      = self::getPrimaryKeys();
        $tableName = self::getTableName();
        $types     = self::getTypes();
        
        // Build up conditions.
        $whereValues = $whereTypes = $whereConds = array();
        foreach ($conditions as $column => $value)
        {
            if (isset($types[$value]) && ($types[$value] == 'istring'))
            {
                $whereConds[] = $column . ' ILIKE :' . $column;
            }
            else
            {
                $whereConds[] = $column . ' = :' . $column;
            }
            
            $whereValues[$column] = $value;
            $whereTypes[$column]  = isset($types[$column]) ? $types[$column] : 'string';
        }
        
        // Build select clause.
        $query = Query::select()->
            from(self::getTableName())->
            where($whereConds)->
            limit($limit, $offset)->
            orderBy($ordering);
        
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
        }
        
        return $list;
    }
    
    /**
     * Loads entities.
     * /
    public static function load($keyValues) 
    {
        // NOTE: Not yet needed, I think.
    }
    */
    
    /**
     * Saves all entities to the database.
     */
    public function save()
    {
        Database::getInstance()->startTransaction();
        
        try
        {
            foreach ($this->entities as $entity) 
            {
                $entity->save();
            }
        }
        catch (Exception $e)
        {
            Database::getInstance()->rollback();
            
            throw $e;
        }
        
        Database::getInstance()->commit();
    }
    
    /**
     * Deletes all entities from the database.
     */
    public function delete()
    {
        Database::getInstance()->startTransaction();
        
        try
        {
            foreach ($this->entities as $entity) 
            {
                $entity->delete();
            }
        }
        catch (Exception $e)
        {
            Database::getInstance()->rollback();
            
            throw $e;
        }
        
        Database::getInstance()->commit();
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
