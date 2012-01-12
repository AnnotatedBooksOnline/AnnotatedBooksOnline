<?php
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Setting entity. This represents settings that can be set in the database.
 */
class Setting extends Entity
{
    /** Name of the setting. */
    protected $settingName;
    
    /** Value of the setting. */
    protected $settingValue;
    
    /**
     * Constructs a setting entity.
     *
     * @param $name  Name of the setting. Default (null) will create a new setting.
     */
    private function __construct($name = null)
    {
        if ($name !== null)
        {
            $this->settingName = $name;
            
            $this->load();
        }
    }
    
    /**
     * Returns the value associated with the provided setting name. If such a setting does not
     * exist, the default argument is returned.
     * 
     * @param string $name     The name of the setting.
     * @param string $default  The result if the setting does not exist.
     * 
     * @return string The value of the setting.
     */
    public static function getSetting($name, $default = null)
    {
        try
        {
            $setting = new Setting($name);
            
            return $setting->getSettingValue();
        }
        catch (EntityException $e)
        {
            return $default;
        }
    }
    
    /**
     * Sets the value of the specified setting, creating it if it does not yet exist.
     * 
     * @param string $name   The name of the setting.
     * @param string $value  The new value of the setting.
     */
    public static function setSetting($name, $value)
    {
        $entity = new Setting($name);
        $entity->settingValue = $value;
        $entity->save();
    }
    
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
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        // TODO: Rename to name, value.
        
        return array(
            'settingName'  => 'string',
            'settingValue' => 'string',
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getSettingName()      { return $this->settingName;  }
    public function setSettingName($name) { $this->settingName = $name; }
    
    public function getSettingValue()       { return $this->settingValue;   }
    public function setSettingValue($value) { $this->settingValue = $value; }
}
