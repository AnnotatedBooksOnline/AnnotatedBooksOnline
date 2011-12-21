<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/book/binding.php';

/**
 * Binding upload controller class.
 */
class BindingUploadController extends Controller
{
    /**
     * Uploads a binding.
     */
    public function actionUpload($data)
    {
        // TODO: exceptions
        
        // Assert that the user is authenticated. 
        Authentication::assertLoggedOn();
        
        // Create binding.
        $binding = new Binding();        
        
        // Retrieve contents of record.
        $record = self::getArray($data, 'record');
        $scans = $record['scans'];
        $binding = $record['binding'];
        $books = $record['books'];
        
        // Transaction.
        Database::getInstance()->doTransaction(
        function() use ($scans, $binding, $books)
        {
            // Determine the binding's library.
            $library = $binding['library'];
            $lentity = new Library();
            $lentity->setLibraryName($library);
            
            $lresult = $lentity->getSelectQuery()->where('libraryName = :libname')
                                                 ->execute(array('libname' => $library));
                                                 
            
            if($lresult->getRowCount() == 0)
            {
                // Library does not yet exist, create one.    
                $lentity->save();
            }
            else
            {
                // Library does exist, load it.
                $lentity->load();
            }
                             
            // Create binding.
            $binentity = new Binding();
            $binentity->setLibraryId($lentity->getLibraryId());
            $binentity->setSignature($binding['signature']);
            if(isset($binding['summary']))
                $binentity->setSummary($binding['summary']);
            $binentity->save();
            
            //TODO: provenance
            
            // Create books.
            foreach($books as $book)
            {
                $bentity = new Book();
                $bentity->setTitle($book['title']);
                $bentity->setBindingId($binentity->getBindingId());
                $bentity->setMinYear($book['minYear']);
                $bentity->setMaxYear($book['maxYear']);
                if(isset($book['preciseDate']))
                {
                    $bentity->setPreciseDate($book['preciseDate']);
                }
                if(isset($book['placePublished']))
                {
                    $bentity->setPlacePublished($book['placePublished']);
                }
                if(isset($book['publisher']))
                {
                    $bentity->setPublisher($book['publisher']);
                }
                if(isset($book['printVersion']))
                {
                    $bentity->setPrintVersion($book['printVersion']);
                }
                
                //TODO: author
            }
            
            // Create scans.
            foreach($scans as $scan)
            {
                $sentity = new Scan();
                //TODO: scans (token, filename, 
            }
        }); 
        
        // Create the books.
        for ($i = 0; $i < 10; $i++)
        {
            // Create book.
            $book = new Book();
            
            // TODO: Fill the book details.
            
            $binding->getBookList()->addEntity($book);
        }
        
        // Save everything.
        $binding->save();
    }
}
