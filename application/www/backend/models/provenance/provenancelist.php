<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'models/provenance/provenance.php';


/**
 * Class representing a booklanguage entity.
 */
class ProvenanceList extends EntityList
{
    public function setBindingId($bindingId) 
    {
        foreach ($this->entities as $entity)
        {
            $entity->setBindingId($bindingId);
        }
    }
}
