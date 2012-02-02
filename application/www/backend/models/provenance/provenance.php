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
    
    /**
     * Returns all the readers of one binding
     *
     * @param $binding  The binding model
     * @return  Array of provenance models
     */
    public static function fromBinding($binding)
    {
        $provenances = ProvenanceList::find(array('bookId' => $book->getBookId()))->getEntities();
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
    
    /**
     * Getters and setters.
     */
    
    public function getBindingId()           { return $this->bindingId;       }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getPersonId()          { return $this->personId;      }
    public function setPersonId($personId) { $this->personId = $personId; }
}
