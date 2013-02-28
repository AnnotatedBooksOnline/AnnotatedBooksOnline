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

/**
 * Log class.
 */
class Log extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** Logging file. */
    private $file;
    
    /** Logging level. */
    private $level;
    
    
    /**
     * Returns the handle to the log file to be used.
     */
    private static function openLogFile()
    {
        // The directory in which to find the log files.
        global $applicationPath;
        $logPath = "$applicationPath/logs";
        
        // Clear the file stat cache.
        clearstatcache();
        
        // Get the rotation period.
        $rotPeriod = Configuration::getInstance()->getInteger('log-rotation-period', 0);
        
        if($rotPeriod == 0)
        {
            // If zero, simply use log.txt.
            return fopen("$logPath/log.txt", 'a'); 
        }
        else
        {
            // Otherwise, retreive the log file through the current.log symlink.
            $logLink = "$logPath/current.log";
			
			// Set success to false whenever an error occurs.
			$success = true;
			$success &= is_link($logLink);
			
            $file = false;
            if(is_link($logLink))
            {
                $file = readlink($logLink);
            }
			$success &= $file !== false;
            
            // Retreive the date from this filename as a timestamp. C
            $fileDate = strtotime(basename($file));
			$success &= $fileDate !== false;
            
            // The number of seconds in a day.
            $dayLength = 86400;

			// When an error occurred while trying to open current.log, or when the rotation period 
			// is over, try creating/opening a new log file for the current day.
			if(!$success || time() - $fileDate > $dayLength * $rotPeriod)
			{
				// Create a new log file for today. 
                // Its filename is the date (plus extension) and should be readable with strtotime.
                $newFile = "$logPath/" . date('d-m-y') . '.log';
                
                try
				{
					// Unlink the previous current.log.
					if(is_link($logLink))
					{
						unlink($logLink);
					}
					
					// Let current.log point to this file.
					if(symlink($newFile, $logLink))
					{
					    // Use the new log file.
					    $file = $newFile;
					}
                }
				catch(Exception $ex)
				{
					// Keep using the old log on rotation failure.
				}
			}
            
            // Open/create the file for appending.
            if($file !== false)
            {
                return fopen($file, 'a');
            }
            else
            {
                // Can not open a log at all.
                throw new Exception('Failed opening log file.');
            }
        }
    }
    
    /**
     * Constructs a log class instance.
     */
    protected function __construct()
    {
        // Set file to null. It will be opened when it is used for the first time.
        $this->file = null;
        
        // Get log level.
        $this->level = Configuration::getInstance()->getInteger('logging-level', 2);
    }
    
    /**
     * Closes log file.
     */
    public function __destruct()
    {
        if($this->file !== null)
		{
			fclose($this->file);
		}
    }
    
    /**
     * Adds a trace message.
     *
     * @param  $format  The format of the message.
     * @param  ...      The arguments of the format.
     */
    public static function trace($format)
    {
        // Check whether to log it.
        $instance = self::getInstance();
        
        if ($instance->level < 5)
        {
            return;
        }
            
        
        // Get arguments of the function, minus the format
        $args = func_get_args();
        array_shift($args);
        
        // Add a line.
        $instance->appendLine('TRACE', vsprintf($format, $args));
    }
    
    /**
     * Adds a debug message.
     *
     * @param  $format  The format of the message.
     * @param  ...      The arguments of the format.
     */
    public static function debug($format)
    {
        // Check whether to log it.
        $instance = self::getInstance();
        if ($instance->level < 4)
        {
            return;
        }
        
        // Get arguments of the function, minus the format
        $args = func_get_args();
        array_shift($args);
        
        // Add a line.
        $instance->appendLine('DEBUG', vsprintf($format, $args));
    }
    
    /**
     * Adds an info message.
     *
     * @param  $format  The format of the message.
     * @param  ...      The arguments of the format.
     */
    public static function info($format)
    {
        // Check whether to log it.
        $instance = self::getInstance();
        if ($instance->level < 3)
        {
            return;
        }
        
        // Get arguments of the function, minus the format
        $args = func_get_args();
        array_shift($args);
        
        // Add a line.
        $instance->appendLine('INFO', vsprintf($format, $args));
    }
    
    /**
     * Adds a warning message.
     *
     * @param  $format  The format of the message.
     * @param  ...      The arguments of the format.
     */
    public static function warn($format)
    {
        // Check whether to log it.
        $instance = self::getInstance();
        if ($instance->level < 2)
        {
            return;
        }
        
        // Get arguments of the function, minus the format
        $args = func_get_args();
        array_shift($args);
        
        // Add a line.
        $instance->appendLine('WARN', vsprintf($format, $args));
    }
    
    /**
     * Adds an error message.
     *
     * @param  $format  The format of the message.
     * @param  ...      The arguments of the format.
     */
    public static function error($format)
    {
        // Check whether to log it.
        $instance = self::getInstance();
        if ($instance->level < 1)
        {
            return;
        }
        
        // Get arguments of the function, minus the format
        $args = func_get_args();
        array_shift($args);
        
        // Add a line.
        $instance->appendLine('ERROR', vsprintf($format, $args));
    }
    
    // Appends a line to the log file.
    private function appendLine($type, $line)
    {
        // Open log file, if neccessary.
		if($this->file === null)
		{
			$this->file = self::openLogFile();
		}
		
		// Append line to file.
        fwrite($this->file, gmdate("Y/m/d H:i:s") . ' - ' . $type . ': ' . trim($line) . "\n");
    }
}
