<?php
//[[GPL]]

require_once 'framework/database/database.php';
require_once 'framework/database/entity.php';

/**
 * Abstract class for a list of entities database entity.
 */
abstract class EntityList
{
    
    protected $entities;
    
    // TODO Mathijs : Functionality for loading multiple entities.
    // TOO Mathijs : Functionality for deleting multiple entities.
    
    /**
     * 
     * Enter description here ...
     */
    public function __construct()
    {
        $this->entities = array();
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $entity
     */
    public function addEntity($entity) 
    {
        array_push($this->entities, $entity);
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $index
     */
    public function entityAt($index)
    {
        return $this->entities[$index];
    }
    
    /**
     * 
     * Enter description here ...
     */
    public function save()
    {
        foreach ($this->entities as $entity) 
        {
            $entity->saveWithDetails();
        }
    }    
    
    
    
    
    
    
}
