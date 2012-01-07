<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/book/book.php';
require_once 'models/author/author.php';
require_once 'models/person/person.php';
require_once 'util/authentication.php';

/**
 * Author controller class.
 */
class AuthorController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads author. 
     */
    public function actionLoad($data)
    {
        if (isset($data['filters'])
         && isset($data['filters'][0])
         && isset($data['filters'][0]['column'])
         && $data['filters'][0]['column'] == 'bookId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the book id from the request
            $bookId = self::getInteger($data['filters'][0], 'value', 0);
            $book = new Book($bookId);
            
            $authors = Author::fromBook($book);
            $authors = array_map(function($author)
            {
                $person = new Person($author->getPersonId());
                $author = $author->getValues(true, false);
                $author['name'] = $person->getName();
                return $author;
            }, $authors);
            
            return array('records' => $authors, 'total' => count($authors));
        }
    }
}
