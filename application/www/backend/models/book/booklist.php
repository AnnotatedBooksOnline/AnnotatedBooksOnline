<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'framework/database/book.php';


/**
 * Class representing a book entity.
 */
class BookList extends EntityList
{
    public function setBindingId($bindingId) {
        foreach ($entities as $entity)
        {
            $entity->setBindingId($bindingId);
        }
    }
}