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

require_once 'framework/util/singleton.php';

// Exceptions.
class ConfigurationException extends ExceptionBase { }
class SettingNotFoundException extends ConfigurationException { }

/**
 * Configuration class.
 */
class Configuration extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** All settings, by name. */
    private $settings;
    
    /**
     * Constructs a configuration class instance.
     */
    protected function __construct()
    {
        $this->settings = array();
                
        // Read settings from the config file.
        global $applicationPath;
        $this->addSettings("$applicationPath/config/config.ini");
    }
    
    /**
     * Gets a string value.
     *
     * @param  $name     The name of the setting.
     * @param  $default  The default of this setting. Defaults to an exception
     *                   if no setting with the given name is found.
     *
     * @return  The setting its value.
     *
     * @throws  SettingNotFoundException  If the setting could not be found and there is no default.
     */
    public function getString($name, $default = null)
    {
        if (isset($this->settings[$name]))
        {
            return $this->settings[$name];
        }
        else if ($default !== null)
        {
            return $default;
        }
        else
        {
            throw new SettingNotFoundException('setting-not-found', $name);
        }
    }
    
    /**
    * Gets a string value denoting a path. If the path does not start with '/', the current 
    * directory is prepended.
    * 
    * Note: only works with Unix-style paths.
    *
    * @param  $name     The name of the setting.
    * @param  $default  The default of this setting. Defaults to an exception
    *                   if no setting with the given name is found.
    *
    * @return  The setting its value.
    *
    * @throws  SettingNotFoundException  If the setting could not be found and there is no default.
    */
    public function getPath($name, $default = null)
    {
        $path = $this->getString($name, $default);
        if(count($path) > 0 && !$path[0] != '/')
        {
            $path = getcwd() . '/' . $path;
        }
        
        return $path;
    }
    
    /**
     * Gets an integer value.
     *
     * @param  $name     The name of the setting.
     * @param  $default  The default of this setting. Defaults to an exception
     *                   if no setting with the given name is found.
     *
     * @return  The setting its value.
     *
     * @throws  SettingNotFoundException  If the setting could not be found and there is no default.
     */
    public function getInteger($name, $default = null)
    {
        return (int) $this->getString($name, $default);
    }
    
    /**
     * Gets a floating point value.
     *
     * @param  $name     The name of the setting.
     * @param  $default  The default of this setting. Defaults to an exception
     *                   if no setting with the given name is found.
     *
     * @return  The setting its value.
     *
     * @throws  SettingNotFoundException  If the setting could not be found and there is no default.
     */
    public function getDouble($name, $default = null)
    {
        return (double) $this->getString($name, $default);
    }
    
    /**
     * Gets a boolean value.
     *
     * @param  $name     The name of the setting.
     * @param  $default  The default of this setting. Defaults to an exception
     *                   if no setting with the given name is found.
     *
     * @return  The setting its value.
     *
     * @throws  SettingNotFoundException  If the setting could not be found and there is no default.
     */
    public function getBoolean($name, $default = null)
    {
        return (bool) $this->getString($name, $default);
    }
    
    /**
     *  Adds settings from a file.
     */
    private function addSettings($filename)
    {
        // Check for file.
        if (!file_exists($filename))
        {
            throw new ConfigurationException('config-file-not-found', $filename);
        }
        
        // Load ini file and add settings.
        $settings = parse_ini_file($filename, false);
        $this->settings = array_merge($this->settings, $settings);
    }
    
    /**
     * Returns the base URL.
     */
    public static function getBaseURL()
    {
        return Configuration::getInstance()->getString('base-url');
    }
    
    /**
     * Returns the database table prefix.
     */
    public static function getDatabasePrefix()
    {
        return Configuration::getInstance()->getString('database-prefix', '');
    }
}

