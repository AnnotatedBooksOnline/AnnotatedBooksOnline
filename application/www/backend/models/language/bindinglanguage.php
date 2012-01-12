<?php 
//[[GPL]]

require_once 'framework/database/assocentity.php';
require_once 'framework/database/database.php';

/**
 * Associative enity representing the language of a binding.
 */
class BindingLanguage extends AssociativeEntity
{
    /** Binding. */
    protected $bindingId;
    
    /** Language. */
    protected $languageId;
    
    /**
     * Constructs a binding-language relation.
     *
     * @param $bindingId
     * @param $languageId
     * @param $createNew  If true, a new relation will be created if the specified one did not 
     *                    exist yet. If one already exists, it doesn't really matter whether 
     *                    this is true or false.
     */
    public function __construct($bindingId = null, $languageId = null, $createNew = false)
    {
        if (($languageId !== null) && ($bindingId !== null))
        {
            $this->bindingId  = $bindingId;
            $this->languageId = $languageId;
            
            if ($createNew)
            {
                $this->save();
            }
            else
            {
                $this->load();
            }
        }
    }
    
    /**
     * Creates a new relation between a binding and a language or retreives one if it already exists.
     * 
     * The id's of the binding and the language should be set.
     *  
     * @param Binding     $binding
     * @param Language $language
     */
    public static function createOrGet($binding, $language)
    {
        return new BindingLanguage($binding->getBindingId(), $language->getLanguageId(), true);
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'BindingLanguages';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('bindingId', 'languageId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array();
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'bindingId'  => 'int',
            'languageId' => 'int'
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getBindingId()           { return $this->bindingId;       }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getLanguageId()    { return $this->languageId; }
    public function setLanguageId($id) { $this->languageId = $id;  }
}
