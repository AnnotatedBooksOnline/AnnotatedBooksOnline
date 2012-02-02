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
 * Translator class.
 */
class Translator extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** All entries, by id. */
    private $entries;
    
    /**
     * Constructs a configuration class instance.
     */
    protected function __construct()
    {
        $this->entries = array();
        
        // Load framework and custom translation files.
        $this->addEntries('framework/translation/en-US/');
        $this->addEntries('translation/en-US/');
    }
    
    /**
     * Gets a language entry.
     *
     * @param  $id    The id of the entry.
     * @param  $args  The arguments to apply to the entry. Format is that of printf.
     *
     * @return  The language entry.
     */
    public function getEntry($id, $args = array())
    {
        if (isset($this->entries[$id]))
        {
            return vsprintf($this->entries[$id], $args);
        }
        else
        {
            return $id;
        }
    }
    
    /**
     *  Adds language file entries from a directory.
     */
    private function addEntries($directory)
    {
        // Load the entries from the language files in the directory.
        foreach (scandir($directory) as $filename)
        {
            if (substr($filename, -4) == '.ini')
            {
                // Load ini file and add entries.
                $entries = parse_ini_file($directory . $filename, false);
                $this->entries = array_merge($this->entries, $entries);
            }
        }
    }
}

/**
 * Define a shortcut function to get an entry.
 */
function __($id)
{
    // Get arguments of the function, minus the id.
    $args = func_get_args();
    array_shift($args);
    
    // Get the translation entry.
    return Translator::getInstance()->getEntry($id, $args);
}
