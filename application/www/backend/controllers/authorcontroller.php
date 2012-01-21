<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/author/authorlist.php';
require_once 'models/person/person.php';

/**
 * Author controller class.
 */
class AuthorController extends ControllerBase
{
    /**
     * Loads authors.
     */
    public function actionLoad($data)
    {
        $records = array();
        $filters = self::getArray($data, 'filters');
        foreach ($filters as $filter)
        {
            if (self::getString($filter, 'column') == 'bookId')
            {
                $bookId = self::getInteger($filter, 'value');
                $authors = AuthorList::find(array('bookId' => $bookId));
                foreach ($authors as $author)
                {
                    $person = new Person($author->getPersonId());
                    $records[] = array(
                        'bookId'   => $author->getBookId(),
                        'personId' => $author->getPersonId(),
                        'name'     => $person->getName()
                    );
                }
                break;
            }
        }
        return array(
            'records' => $records,
            'total'   => count($records)
        );
    }
}

