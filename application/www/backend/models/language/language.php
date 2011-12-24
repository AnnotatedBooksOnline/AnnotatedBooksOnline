<?php
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a language.
 */
class Language extends Entity
{
    /** The identifier of a language. */
    protected $languageId;
    
    /** The name of the language. */
    protected $languageName;
    
    
    /**
    * Constructs a language entity.
    *
    * @param $id  Id of the language. Default (null) will create a new one.
    */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->languageId = $id;
            $this->load();
        }
    }
    
    /**
     * Returns an array of all languages present in the database.
     * 
     * @return array(Language) Array of language entities for each language.
     */
    public static function getAvailableLanguages()
    {
        $langs = Query::select()->from('Languages')->execute();
        $result = array();
        
        foreach($langs as $lang)
        {
            $entity = new Language();
            $entity->setLanguageId($lang->getValue('languageId'));
            $entity->setLanguageName($lang->getValue('languageName'));

            $result[] = $entity;
        }
        
        return $result;
    }
    
    
    /**
    * Get the name of the corresponding table.
    */
    protected function getTableName()
    {
        return 'Languages';
    }
    
    /**
     * Get an array with the primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('languageId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    protected function getColumns()
    {
        return array('languageName');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                'languageId'   => 'int',
                'languageName' => 'string'
        );
    }
    
    
    /*
    * Getters and setters.
    */
    
    public function getLanguageId()    { return $this->languageId; }
    public function setLanguageId($id) { $this->languageId = $id;  }
    
    public function getLanguageName()      { return $this->languageName;  }
    public function setLanguageName($name) { $this->languageName = $name; }
    
}