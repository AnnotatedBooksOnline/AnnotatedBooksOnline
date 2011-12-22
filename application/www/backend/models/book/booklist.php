<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'models/book/book.php';


/**
 * Class representing a book entity.
 */
class BookList extends EntityList
{
    public function setBindingId($bindingId) {
        foreach ($this->entities as $entity)
        {
            $entity->setBindingId($bindingId);
        }
    }
}
