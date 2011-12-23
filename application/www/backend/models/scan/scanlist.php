<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/entitylist.php';

require_once 'models/scan/scan.php';


/**
 * Class representing a book entity.
 */
class ScanList extends EntityList
{
    public function setBookId($bookId) 
    {
        foreach ($this->entities as $entity)
        {
            $entity->setBookId($bookId);
        }
    }
}
