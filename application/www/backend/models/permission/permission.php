<?php
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Permission entity. This represents actions restricted to specific users.
 */
class Permission extends Entity
{
    /** Name of the associated action. */
    protected $actionName;
    
    /** Minimal rank required to undertake this action. */
    protected $minRank;
    
    /**
     * Constructs a permission entity.
     *
     * @param $name  Name of the permission. Default (null) will create a new permission.
     */
    private function __construct($name = null)
    {
        if ($name !== null)
        {
            $this->actionName = $name;
            
            $this->load();
        }
    }
    
    /**
     * Indicates whether a user with a provided rank has permission to undertake the action with 
     * a certain name. 
     *
     * @param string $action The name of the action.
     * @param int    $rank   The user rank for which to test the permission. 
     * 
     * @return bool true if if the rank is high enough for this action, false otherwise.
     * 
     * @throws EntityException If no action with this name could be found in the database.
     */
    public function hasPermission($action, $rank)
    {
        // Create and load permission entity.  
        $permission = new Permission($action);
        
        // Compare ranks.
        return $rank >= $permission->getMinRank();
    }
    
    /**
     * Get the name of the corresponding table.
     */
    protected function getTableName()
    {
        return 'Permissions';
    }
    
    /**
     * Get an array with the primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('actionName');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    protected function getColumns()
    {
        return array('minRank');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'actionName'  => 'string',
            'minRank'     => 'int',
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getActionName()      { return $this->actionName;  }
    public function setActionName($name) { $this->actionName = $name; }
    
    public function getMinRank()      { return $this->minRank;  }
    public function setMinRank($rank) { $this->minRank = $rank; }
}