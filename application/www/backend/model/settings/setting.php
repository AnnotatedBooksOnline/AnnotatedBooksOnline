<?php

require_once 'framework/database/entity.php';

/**
 * Setting entity. This represents settings that can be set in the database.
 */
class Setting extends Entity
{
    /** Setting name - varchar(100) */
    protected $settingName;
    
    /** Setting value - text */
    protected $settingValue;
    
    
    /**
    * Constructs a setting entity.
    * @param $name If null, an empty setting entity will be created. Otherwise one with the 
    *              provided name will be loaded.
    */
    public function __construct($name = null)
    {
        if($uid !== null)
        {
            $this->load();
        }
    }
    
    
    // Helpers.
    
    /**
     * Returns the value associated with the provided setting name. If such a setting does not
     * exist, the default argument is returned.
     * 
     * @param string $setting The name of the setting.
     * @param string $default The result if the setting does not exist.
     * 
     * @return string The value of the setting.
     */
    public static function getSettingValue($setting, $default = null)
    {
        $entity = new Setting();
        $entity->settingName = $setting;
        
        $result = $entity->getSelectQuery()->execute();
        
        if($result->getAmount() == 0)
        {
            return $default;
        }
        else
        {
            return $result->getFirstRow()->getValue('settingValue');
        }
    }
    
    /**
     * Sets the value of the specified setting, creating it if it does not yet exist.
     * 
     * @param string $setting The name of the setting.
     * @param string $value   The new value of the setting.
     */
    public static function setSettingValue($setting, $value)
    {
        $entity = new Setting($setting);
        $entity->settingValue = $value;
        $entity->save();
    }
    
    
    // Table information.
    
    /**
    * Get the name of the corresponding table.
    */
    public static function getTableName()
    {
        return 'Settings';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('settingName');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('settingValue');
    }
    
    
    // Getters and setters.
    
    public function getSettingName() {return $this->settingName;}
    public function setSettingName($name) {$this->settingName = $name;}
    
    public function getSettingValue() {return $this->settingValue;}
    public function setSettingValue($val) {$this->settingValue = $val;}
}