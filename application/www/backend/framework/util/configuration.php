<?php
//[[GPL]]

require_once 'framework/util/singleton.php';

// Exceptions.
class SettingNotFoundException extends ExceptionBase { }

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
        
        // Load framework its default settings and custom settings.
        $this->addSettings('framework/config/default.ini');
        $this->addSettings('config/config.ini');
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
    
    // Adds settings from a file.
    private function addSettings($filename)
    {
        // Load ini file and add settings.
        $settings = parse_ini_file($filename, false);
        $this->settings = array_merge($this->settings, $settings);
    }
}
