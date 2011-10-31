<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';

class SettingNotFoundException extends Exception
{
    // TODO
}

/**
 * Configuration class.
 */
class Configuration extends Singleton
{
    const FILE_PATH = "config/config.ini";
    
    /** All settings, by name. */
    private $settings;
    
    /**
     * Constructs a configuration class instance.
     */
    protected function __construct()
    {
        // Load the settings from the configuration file.
        $this->settings = parse_ini_file(self::FILE_PATH, true);
    }
    
    /**
     * Gets the configuration singleton instance.
     *
     * @return  The unique instance of the configuration.
     */
    public static function getInstance()
    {
        return parent::getInstance(__CLASS__);
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
            return (int) $this->settings[$name];
        }
        else if ($default !== null)
        {
            return $default;
        }
        else
        {
            throw new SettingNotFoundException('Could not find setting \'' . $name . '\'.');
        }
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
}
