<?php 
//[[GPL]]

require_once 'framework/database/assocentity.php';
require_once 'models/binding/binding.php';

/**
 * Class representing a provenance entity. Associatieve between binding and person.
 */
class Provenance extends AssociativeEntity
{
    /** Binding id. */
    protected $bindingId;
    
    /** Person id. */
    protected $personId;
       
    /**
     * Constructs a provenance by binding and person ids.
     *
     * @param  $bindingId  Id of the binding. Default (null) will create a new provenance.
     * @param  $personId   Id of the person. Default (null) will create a new provenance.
     */
    public function __construct($bindingId = null, $personId = null)
    {
        if (($bindingId !== null) && ($personId !== null))
        {
            $this->bindingId = $bindingId;
            $this->personId  = $personId;
            
            $this->load();
        }
    }
    
    public static function fromBinding($binding)
    {
        // TODO: Create ProvenanceList to do this.
        
        $result = Query::select('personId', 'bindingId')
            ->from('Provenances')
            ->where('bindingId = :binding')
            ->execute(array('binding' => $binding->getBindingId()));
            
        $provenances = array();
        
        foreach ($result as $provenance)
        {
            $provenances[] = new Provenance(
                $provenance->getValue('bindingId'),
                $provenance->getValue('personId')
            );
        }
        
        return $provenances;
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Provenances';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('bindingId', 'personId');
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
            'bindingId' => 'int',
            'personId'  => 'int'
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getBindingId()               { return $this->bindingId;       }
    public function setBindingId($bindingId)     { $this->bindingId = $bindingId; }
    
    public function getPersonId()             { return $this->personId;      }
    public function setPersonId($personId)    { $this->personId = $personId; }
}
