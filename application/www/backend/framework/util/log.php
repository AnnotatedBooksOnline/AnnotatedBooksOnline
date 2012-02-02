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
     * Constructs a log class instance.
     */
    protected function __construct()
    {
        // Open log file.
        $this->file = fopen('../data/logs/log.txt', 'a');
        
        // Get log level.
        $this->level = Configuration::getInstance()->getBoolean('logging-level', 2);
    }
    
    /**
     * Closes log file.
     */
    public function __destruct()
    {
        fclose($this->file);
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
        // Append line to file.
        fwrite($this->file, gmdate("Y/m/d H:i:s") . ' - ' . $type . ': ' . trim($line) . "\n");
    }
}
