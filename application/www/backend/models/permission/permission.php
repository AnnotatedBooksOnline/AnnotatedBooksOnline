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
     * Indicates whether some user with the provided rank has permission to undertake the action with 
     * a certain name. 
     *
     * @param string $action The name of the action.
     * @param int    $rank   The user rank for which to test the permission. 
     * 
     * @return bool true if if the rank is high enough for this action, false otherwise.
     * 
     * @throws EntityException If no action with this name could be found in the database.
     */
    public static function rankHasPermission($action, $rank)
    {
        // Create and load permission entity.
        try
        {
            $permission = new Permission($action);
        }
        catch (EntityException $e)
        {
            return false;
        }
        
        // Compare ranks.
        return ($rank >= $permission->getMinRank());
    }
    
    /**
     * Returns an array of all actions a user with the specified rank is allowed to perform. 
     *
     * @param int $rank The rank of the kind of user for which to receive the permission list.
     * 
     * @return array An array of strings representing action names.
     */
    public static function getPermissionListForRank($rank)
    {
        $resultSet = Query::select('actionName')
                   ->from('Permissions')
                   ->where('minRank <= :rank')
                   ->execute(array('rank' => $rank));
        
        $list = array();
        foreach ($resultSet as $row)
        {
            $list[] = $row->getValue('actionName');
        }
        
        return $list;
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'Permissions';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('actionName');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('minRank');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'actionName' => 'string',
            'minRank'    => 'int',
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