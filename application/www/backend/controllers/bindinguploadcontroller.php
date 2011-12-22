<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/binding/binding.php';
require_once 'models/library/librarysearchlist.php';

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
        //var_dump($data);
        // TODO: exceptions
        
        // Assert that the user is authenticated. 
        Authentication::assertLoggedOn();     
        
        // Retrieve contents of record.
        $inputScans = self::getArray($data, 'scans');
        $inputBinding = self::getArray($data, 'binding');
        $inputBooks = self::getArray($data,'books');
        
        // Transaction.
        //Database::getInstance()->doTransaction(
        //function() use ($inputScans, $inputBinding, $inputBooks)
        //{
            // Find the name of the library the binding belongs to.
            $libraryName = $inputBinding['library'];
        
            // Create the binding and fill its attributes with the information from the request.
            $binding = new Binding();
            $binding->setSignature(self::getString($inputBinding, 'signature'));
            $binding->setSummary(self::getString($inputBinding, 'summary'));
            
            // Find the specified library in the database.
            $existingLibrary = LibrarySearchList::findLibraries(array('libraryName' => $libraryName), null, null, null)->getFirstRow_();
            
            // Determine if the library exists in the database. If this is the case the new binding should link to it. If not
            // the library needs to be created.
            if ($existingLibrary) 
            {
                // Make the new binding link to the existing library.
                $binding->setLibraryId($existingLibrary->getValue('libraryId'));    
            } 
            else 
            {
                // Create a new library and save it.
                $library = new Library();
                $library->setLibraryName($libraryName);
                $library->save();
                
                // Link the binding to the newly created library.
                $binding->setLibraryId($library->getLibraryId());
            }
            
            // Iterate over all books in the input.
            foreach($inputBooks as $inputBook)
            {
                // Create the book and fill its attributes with the information from the request.
                $book = new Book();
                $book->setTitle(self::getString($inputBook, 'title'));
                $book->setMinYear(self::getInteger($inputBook, 'minYear'));
                $book->setMaxYear(self::getInteger($inputBook, 'maxYear'));
                $book->setPreciseDate(self::getString($inputBook, 'preciseDate'));
                $book->setPlacePublished(self::getString($inputBook, 'placePublished'));
                $book->setPublisher(self::getString($inputBook, 'publisher'));
                $book->setPrintVersion(self::getInteger($inputBook, 'printVersion'));
                
                // Add the book to the binding.
                $binding->getBookList()->addEntity($book);
                
                //TODO: author
            }
            
            // Create scans.
            foreach($inputScans as $scan)
            {
                //$sentity = new Scan();
                //TODO: scans (token, filename, 
            }
            
            // Save the binding and all its attribute entities.
            $binding->saveWithDetails();
       //}); 
      
    }
}
