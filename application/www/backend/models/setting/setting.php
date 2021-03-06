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

require_once 'framework/database/entity.php';

class SettingException extends ExceptionBase { }

/**
 * Setting entity. This represents settings that can be set in the database.
 */
class Setting extends Entity
{
    /** Name of the setting. */
    protected $settingName;
    
    /** Value of the setting. */
    protected $settingValue;
    
    /** Whether the setting is visible to the client. */
    protected $visible;
    
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
     * exist, the default argument is returned (if one is defined; otherwise an exception is 
     * thrown).
     * 
     * @param string $name         The name of the setting.
     * @param string $default      The result if the setting does not exist.
     * @param bool   $onlyVisible  Only publicly visible settings are returned.
     * 
     * @return string The value of the setting.
     * 
     * @throws SettingException If default is null and the setting is not present.
     */
    public static function getSetting($name, $default = null, $onlyVisible = false)
    {
        try
        {
            $setting = new Setting($name);
            
            if($onlyVisible && !$setting->getVisible())
            {
                throw new SettingException('setting-not-visible', $name);
            }
            
            return $setting->getSettingValue();
        }
        catch (EntityException $e)
        {
            if($default === null)
            {
                throw new SettingException('setting-not-found', $name);
            }
            
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
     * Returns an associative array of all settings and their values. 
     * 
     * @param bool $onlyVisible Whether only visible settings should be included in the result.
     * 
     * @return array Mapping of setting names to their values.
     */
    public static function getSettings($onlyVisible = false)
    {
        // Build query.
        $query = Query::select('settingName', 'settingValue')->from('Settings');
        $params = array();
        $types = array();
        
        // Restrict to visible ones if neccessary.
        if($onlyVisible)
        {
            $query->where('visible = :visible');
            $params['visible'] = 1;
            $types['visible'] = 'int';
        }
        
        // Iterate over the resultset and gather settings.
        $settings = array();
        $resultSet = $query->execute($params, $types);
        
        foreach($resultSet as $row)
        {
            $settings[$row->getValue('settingName')] = $row->getValue('settingValue');
        }
        
        // Return the settings.
        return $settings;
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
        return array('settingValue', 'visible');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        
        return array(
            'settingName'  => 'istring',
            'settingValue' => 'istring',
            'visible'      => 'bool'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getSettingName() { return $this->settingName;  }
    
    public function getSettingValue()       { return $this->settingValue;   }
    public function setSettingValue($value) { $this->settingValue = $value; }
    
    public function getVisible() { return $this->visible; }
}
