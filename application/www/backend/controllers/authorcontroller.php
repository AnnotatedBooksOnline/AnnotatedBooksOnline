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
        // Handle load.
        $result =  $this->handleLoad($data, 'Author');
        
        // Augment results with person names.
        foreach ($result['records'] as &$record)
        {
            $person = new Person($record['personId']);
        
            $record['name'] = $person->getName();
        }
        
        return $result;
    }
}
