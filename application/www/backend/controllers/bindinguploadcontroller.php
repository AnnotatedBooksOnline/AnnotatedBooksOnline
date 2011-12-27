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
        Database::getInstance()->startTransaction();
        
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
        $existingProvenancePerson = PersonSearchList::findPersons(array('name' => $provenancePersonName), null, null, null)->getFirstRow_();
            
        // Determine if the provenance person exists in the database. If this is the case the new binding should link to it. If not
        // the library needs to be created.
        if ($existingProvenancePerson) 
        {
            // Make the existing person link to the new provenance.
            $provenance->setPersonId($existingProvenancePerson->getValue('personId'));
        } 
        else 
        {
            // Create a new person and save it in the database
            $provenancePerson = new Person();
            $provenancePerson->setName($provenancePersonName);
            $provenancePerson->save();
             
            // Make the new person link to the provenance.
            $provenance->setPersonId($provenancePerson->getPersonId());
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
                
            // Find the book author
            /*
            $bookAuthor = self::getString($inputBook, 'placePublished');
            $existingBookAuthorPerson = PersonSearchList::findPersons(array('name' => $bookAuthor), null, null, null)->getFirstRow_();
            
            if ($existingBookAuthorPerson)
            {
                // Create a new person and save it in the database
                $provenancePerson = new Person();
                $provenancePerson->setName($provenancePersonName);
                $provenancePerson->save();
                 
                // Make the new person link to the provenance.
                $provenance->setPersonId($provenancePerson->getPersonId());
            }
            else
            {
                
            }*/
            
            // Add the book to the binding.
            $binding->getBookList()->addEntity($book);
                
            //TODO: author
        }
            
        ////////////////////////////////////////////////////////////////////////////////////
        // Create the scans.
        ////////////////////////////////////////////////////////////////////////////////////
            
        // Store a list of processed uploads for deletion later.
        $processedUploads = array();
        $pageNumber = 1;
        
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
            if ($upload == null) 
            {
                throw new ControllerException('upload-does-not-exist');
            }

            // Create the scan entity.
            $scan = new Scan();
            $scan->setStatus(Scan::STATUS_PENDING);
            $scan->setPage($pageNumber++);
            $scan->setUploadId($upload->getUploadId());
            
            // Identify the scan.
            $this->identifyScan($scan, $upload);
            
            // Add the scan to the book.
            // TODO Mathijs : Add the scan to the correct book, right now all scans will be added to the first book.
            $binding->getScanList()->addEntity($scan);
                
        }
            
        // Save the binding and all its attribute entities.
        $binding->saveWithDetails();
        
        Database::getInstance()->commit();
    }
    
    /**
     * Fills a scans attributes based on an upload.
     * @param $scan
     * @param $upload
     * @throws ControllerException
     */
    private function identifyScan($scan, $upload) 
    {
        
        // Get an identification of the image using imagick.
        $scanUploadImage = new Imagick($upload->getFileLocation());
        $scanUploadImageIdentification = $scanUploadImage->identifyimage();
                
        // Determine if the upload is a JPEG file.
        if (strpos($scanUploadImageIdentification['format'], "JPEG") !== false) 
        {
            $scan->setScanType(Scan::TYPE_JPEG);
        } 
        // Determine if the upload is a GIF file.
        else if (strpos($scanUploadImageIdentification['format'], "TIFF") !== false) 
        {
            $scan->setScanType(Scan::TYPE_TIFF);
        } 
        else 
        {
            throw new ControllerException('unsupported-file-type');
        }
        
        //Prepare tile tree
        $maxX = ($scanUploadImageIdentification['geometry']['width'] - 1) / 256 + 1;
        $maxY = ($scanUploadImageIdentification['geometry']['height'] - 1) / 256 + 1;

        // Determine the number of zoom levels for this image.
        $numZoomLevels = 1;
        $maxPowerTwo = 2;
        while ($maxPowerTwo < max($maxX, $maxY)) 
        {
            $maxPowerTwo *= 2;
        }
        while ($maxPowerTwo > 1) 
        {
            $maxPowerTwo /= 2;
            $numZoomLevels++;
        }
        $scan->setZoomLevel($numZoomLevels);
        
        // Determine image dimensinos.
        $minification = pow(2, ($numZoomLevels - 1));
        $scan->setDimensions(ceil($scanUploadImageIdentification['geometry']['width'] / $minification),
                             ceil($scanUploadImageIdentification['geometry']['height'] / $minification));
        
    }
}
