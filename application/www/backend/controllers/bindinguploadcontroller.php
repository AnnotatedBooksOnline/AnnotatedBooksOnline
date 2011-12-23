<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/binding/binding.php';
require_once 'models/library/librarysearchlist.php';
require_once 'models/person/person.php';
require_once 'models/person/personsearchlist.php';
require_once 'models/provenance/provenance.php';
require_once 'models/scan/scan.php';

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
        
        // Find the name of the library the binding belongs to.
        $libraryName = $inputBinding['library'];
        $provenancePersonName = $inputBinding['provenance'];
            
        ////////////////////////////////////////////////////////////////////////////////////
        // Create the binding
        ////////////////////////////////////////////////////////////////////////////////////
            
        // Create the binding and fill its attributes with the information from the request.
        $binding = new Binding();
        $binding->setSignature(self::getString($inputBinding, 'signature'));
        $binding->setSummary(self::getString($inputBinding, 'summary'));
            
        // Find the specified library in the database.
        $existingLibrary = LibrarySearchList::findLibraries(array('libraryName' => $libraryName), null, null, null)->getFirstRow_();
            
        ////////////////////////////////////////////////////////////////////////////////////
        // Create the library
        ////////////////////////////////////////////////////////////////////////////////////
            
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
            
        ////////////////////////////////////////////////////////////////////////////////////
        // Create the provenance
        ////////////////////////////////////////////////////////////////////////////////////
            
        // Create the provenance for the binding
        $provenance = new Provenance();
        // Find the specified provenance person in the database.
        $existingProvenancePerson = PersonSearchList::findPersons(array('name' => $provenancePersonName), null, null, null);
            
        // Determine if the provenance person exists in the database. If this is the case the new binding should link to it. If not
        // the library needs to be created.
        if ($existingProvenancePerson) 
        {
            // Make the existing person link to the new provenance.
            //$provenance->setPersonId($existingLibrary->getValue('personId'));
        } 
        else 
        {
            // Create a new person and save it in the database
            //$provenancePerson = new Person();
            //$provenancePerson->setName($provenancePersonName);
            //$provenancePerson->save();
             
            // Make the new person link to the provenance.
            //$provenance->setPersonId($provenancePerson->getPersonId());
        }

        ////////////////////////////////////////////////////////////////////////////////////
        // Create the books.
        ////////////////////////////////////////////////////////////////////////////////////
            
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
            
        ////////////////////////////////////////////////////////////////////////////////////
        // Create the scans.
        ////////////////////////////////////////////////////////////////////////////////////
            
        // Store a list of processed uploads for deletion later.
        $processedUploads = array();
        $pageNumber = 0;
        
        // Create scans.
        foreach($inputScans as $inputScan)
        {
            // Determine if the scan was succesfully uploaded.
            if (self::getString($inputScan, 'status') != 'success') 
            {
                continue;
            }
                
            // Retrieve the upload from the database and assert it exists.
            $upload = Upload::fromToken(self::getString($inputScan, 'token'));
            if (!isset($upload)) 
            {
                throw new EntityException('upload-does-not-exist');
            }
                
            // Move the upload to the tile builder input path.
            // TODO : Mathijs Dit werkt vanzelfsprekend niet zo fijn met transacties :)
            $scanInputPath = Configuration::getInstance()->getString('scan-input-path');
            $scanFilePath = $scanInputPath . $upload->getFilename();
            copy($upload->getFileLocation(), $scanFilePath);
            
            // Create the scan entity.
            $scan = new Scan();
            $scan->setStatus(Scan::STATUS_PENDING);
            $scan->setScanType(Scan::TYPE_JPEG);
            $scan->setFileName($upload->getFileName());
            $scan->setPage($pageNumber++);
            
            // Add the scan to the book.
            // TODO Mathijs : Add the scan to the correct book, right now all scans will be added to the first book.
            $binding->getBookList()->entityAt(0)->getScanList()->addEntity($scan);
                
        }
            
        // Save the binding and all its attribute entities.
        $binding->saveWithDetails();
            
        // Delete all processed uploads.
        foreach($processedUploads as $processedUpload)
        {
            $processedUpload->delete();
        }

    }
}
