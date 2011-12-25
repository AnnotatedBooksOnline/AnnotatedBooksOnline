<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/binding/binding.php';
require_once 'models/library/library.php';
require_once 'models/scan/scan.php';
require_once 'models/book/book.php';

/**
 * Binding controller class.
 */
class BindingController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads binding. 
     */
    public function actionLoad($data)
    {
        // Retrieve the binding id from the request
        $bindingId = self::getInteger($data, 'id', 0);
        
        $binding = new Binding($bindingId);
        $library = new Library($binding->getLibraryId());
        $scans = Scan::fromBinding($binding);
        $scans = array_map(function($scan)
        {
            return $scan->getValues(true, false);
        }, $scans);
        $books = Book::fromBinding($binding);
        $books = array_map(function($book)
        {
            return $book->getValues(true, false);
        }, $books);

        $binding = $binding->getValues(true, false);
        $binding['library'] = $library->getValues(true, false);
        $binding['scans'] = $scans;
        $binding['books'] = $books;
        
        return array('records' => $binding, 'total' => 1);
    }
}

