<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';

/**
 * Translator class.
 */
class Translator extends Singleton
{
    const FILE_PATH = 'translation/en-US/errors.ini';
    
    /** All entries, by id. */
    private $entries;
    
    /**
     * Constructs a configuration class instance.
     */
    protected function __construct()
    {
        // Load the entries from the language file.
        $this->entries = parse_ini_file(self::FILE_PATH, false);
        
        
        //TODO: (GVV) Handle multiple files.
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
}

// Define a shortcut function to get an entry.
function _($id)
{
    // Get arguments of the function, minus the id.
    $args = func_get_args();
    array_shift($args);
    
    // Get the translation entry.
    return Translator::getInstance()->getEntry($id, $args);
}