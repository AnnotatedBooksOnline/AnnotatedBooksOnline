<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'models/author/author.php';


/**
 * Class representing a booklanguage entity.
 */
class AuthorList extends EntityList
{
    public function setBookId($bookId) 
    {
        foreach ($this->entities as $entity)
        {
            $entity->setBookId($bookId);
        }
    }
}
