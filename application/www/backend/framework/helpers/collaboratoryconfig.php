<?php

require_once 'framework/helpers/singleton.php';

/** Path to the application properties file */
define("CONFIGURATION_FILE_PATH", "config/config.ini");

/**
* Wrapper class around the collaboratory configuraiton.
*/
class CollaboratoryConfig extends Singleton
{    
    /** Database source name. */
    private $databaseDsn;
    
    /** Database username. */
    private $databaseUsername;
    
    /** Database password. */
    private $databasePassword;
    
    /**
     * Constructs a authentication class instance.
     */
    protected function __construct()
    {
        // Load the collaboratory properties from the configuration file.
        $collaboratoryProperties = parse_ini_file(CONFIGURATION_FILE_PATH, true);

        // Parse the properties and save them into instance variables.
        $this->databaseDsn = $collaboratoryProperties["database-dsn"];
        $this->databaseUsername = $collaboratoryProperties["database-username"];
        $this->databasePassword = $collaboratoryProperties["database-password"];
        
    }
    
    /**
     * Gets the session singleton instance.
     * @return  The unique instance of the session.
     */
    public static function getInstance()
    {
        return parent::getInstance(__CLASS__);
    }
    
    /*
     * Getters / setters.
     */
    public function getDatabaseDsn()
    {
        return $this->databaseDsn;
    }
    
    public function getDatabaseUsername()
    {
        return $this->databaseUsername;
    }
    
    public function getDatabasePassword()
    {
        return $this->databasePassword;
    }
}