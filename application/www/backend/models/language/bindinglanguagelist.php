<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'models/language/bindinglanguage.php';


/**
 * Class representing a bindinglanguage entity.
 */
class BindingLanguageList extends EntityList
{
    public function setBindingId($bindingId) 
    {
        foreach ($this->entities as $entity)
        {
            $entity->setBindingId($bindingId);
        }
    }
}
