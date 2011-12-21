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
     * @param unknown_type $entity
     */
    public function addEntity($entity) 
    {
        array_push($entities, entity);
    }
    
    /**
     * 
     * Enter description here ...
     */
    public function save()
    {
        foreach ($entities as $entity) 
        {
            $entity->save();
        }
    }    
    
    
    
    
    
    
}
