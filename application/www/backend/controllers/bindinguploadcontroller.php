<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/binding/binding.php';
require_once 'models/binding/bindingsearchlist.php';
require_once 'models/library/librarysearchlist.php';
require_once 'models/person/person.php';
require_once 'models/person/personsearchlist.php';
require_once 'models/provenance/provenance.php';
require_once 'models/scan/scan.php';
require_once 'models/language/bindinglanguage.php';
require_once 'models/language/booklanguage.php';

class BindingStatusException extends ExceptionBase {}

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
        
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('upload-bindings');  
        
        // Retrieve contents of record.
        $inputScans = self::getArray($data, 'scans');
        $inputBinding = self::getArray($data, 'binding');
        $inputBooks = self::getArray($data,'books');
        
        // Find the name of the library the binding belongs to.
        $libraryName = $inputBinding['library'];
        $signature = self::getString($inputBinding, 'signature');
        
        // Determine if the specified signature exists in the database already, this is not allowed.
        if (!$this->uniqueLibrarySignature($libraryName, $signature))
        {
            throw new ControllerException('duplicate-binding');
        }
        
        // Create the binding and fill its attributes with the information from the request.
        $binding = new Binding();
        $binding->setSummary(self::getString($inputBinding, 'summary'));
        $binding->setSignature($signature);
        $binding->setStatus(Binding::STATUS_UPLOADED);
        
        // Save the books.
        $this->createLibrary($libraryName, $binding);

        // Save the books.
        $this->createBooks($inputBooks, $binding);

        // Save the scans.
        $this->createScans($inputScans, $binding);

        // Save the provenances.
        $this->createProvenances($inputBinding, $binding);
        
        // Create the binding languages.
        $this->createBindingAnnotationLanguages($inputBinding, $binding);
        
        // Save the binding and all its attribute entities.
        $binding->saveWithDetails();
        
        Database::getInstance()->commit();
    }
    
    /**
    *
    * Enter description here ...
    * @param unknown_type $provenancePersonNames
    * @param unknown_type $binding
    */
    private function createLibrary($libraryName, $binding)
    {
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
    }
    
    /**
    *
    * Enter description here ...
    * @param unknown_type $provenancePersonNames
    * @param unknown_type $binding
    */
    private function createBooks($inputBooks, $binding)
    {
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
        
            // Create the book authors.
            $this->createAuthors($inputBook, $book);
            
            // Create the book languages.
            $this->createBookLanguages($inputBook, $book);
            
            // Add the book to the binding.
            $binding->getBookList()->addEntity($book);

        }
    }
    
    /**
     *
     * Enter description here ...
     * @param unknown_type $provenancePersonNames
     * @param unknown_type $binding
     */
    private function createScans($inputScans, $binding)
    {
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
            
            // Add the scan to the bindning.
            $binding->getScanList()->addEntity($scan);
        }
    }
    
    /**
    *
    * Enter description here ...
    * @param unknown_type $provenancePersonNames
    * @param unknown_type $binding
    */
    private function createBookLanguages($inputBook, $book)
    {
        // Create all book language entities.
        foreach(self::getArray($inputBook, 'languages') as $languageId)
        {
           $bookLanguage = new BookLanguage();
           $bookLanguage->setLanguageId($languageId);
              
           $book->getBookLanguageList()->addEntity($bookLanguage);
        }
    }
    
    /**
    *
    * Enter description here ...
    * @param unknown_type $provenancePersonNames
    * @param unknown_type $binding
    */
    private function createBindingAnnotationLanguages($inputBinding, $binding)
    {
        // Create all book language entities.
        foreach(self::getArray($inputBinding, 'languagesofannotations') as $languageId)
        {
            $bindingLanguage = new BindingLanguage();
            $bindingLanguage->setLanguageId($languageId);
             
            $binding->getBindingLanguageList()->addEntity($bindingLanguage);
        }
    }
    
    
    /**
    *
    * Enter description here ...
    * @param unknown_type $provenancePersonNames
    * @param unknown_type $binding
    */
    private function createAuthors($inputBook, $book)
    {
        // Split all persons in the provenance.
        $authorPersonNames = explode(',', self::getString($inputBook, 'author')); 
        
        // Create all provenances.
        foreach($authorPersonNames as $authorPersonName)
        {
            // Create the person for the provenance.
            $person = $this->createPerson($authorPersonName);
    
            // Create the provenance associating the binding with the person.
            $author = new Author();
            $author->setPersonId($person->getPersonId());
    
            // Add the provenance to the binding.
            $book->getAuthorList()->addEntity($author);
        }
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $provenancePersonNames
     * @param unknown_type $binding
     */
    private function createProvenances($inputBinding, $binding)
    {
        // Split all persons in the provenance.
        $provenancePersonNames = explode(',', self::getString($inputBinding, 'provenance')); 
        
        // Create all provenances.
        foreach($provenancePersonNames as $provenancePersonName)
        {
            // Create the person for the provenance.
            $person = $this->createPerson($provenancePersonName);
            
            // Create the provenance associating the binding with the person.
            $provenance = new Provenance();
            $provenance->setPersonId($person->getPersonId());
            
            // Add the provenance to the binding.
            $binding->getProvenanceList()->addEntity($provenance);
        }    
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $inputBinding
     * @param unknown_type $binding
     */
    private function createPerson($personName)
    {
        $existingPerson = PersonSearchList::findPersons(array('name' => $personName), null, null, null)->getFirstRow_();
        
        if ($existingPerson)
        {
            return new Person($existingPerson->getValue('personId'));
        }
        else
        {
            // Create a new person and save it in the database
            $person = new Person();
            $person->setName($personName);
            $person->save();
             
            return $person;
        }
    }
    
    /**
     * Fills a scans attributes based on an upload.
     * @param $scan
     * @param $upload
     * @throws ControllerException
     */
    private function identifyScan($scan, $upload) 
    {
        // Identify the image.
        $scanUploadImageIdentification = getimagesize($upload->getFileLocation());
        if (!$scanUploadImageIdentification)
        {
            throw new ControllerException('unsupported-file-type');
        }
        
        // Determine file type.
        if ($scanUploadImageIdentification[2] == IMAGETYPE_JPEG) 
        {
            $scan->setScanType(Scan::TYPE_JPEG);
        } 
        else if ($scanUploadImageIdentification[2] == IMAGETYPE_TIFF_II) 
        {
            $scan->setScanType(Scan::TYPE_TIFF);
        } 
        else 
        {
            throw new ControllerException('unsupported-file-type');
        }

        $columns = $scanUploadImageIdentification[0]/256;
        $rows = $scanUploadImageIdentification[1]/256;
        
        $maxZoomLevel = ceil(log(max($columns, $rows))/log(2));
        
        $scan->setZoomLevel($maxZoomLevel+1);
        
        // Determine image dimensions.
        $minification = pow(2, $maxZoomLevel);
        $scan->setDimensions(ceil($scanUploadImageIdentification[0] / $minification),
                             ceil($scanUploadImageIdentification[1] / $minification));
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     * @return multitype:unknown |multitype:number
     */
    public function actionGetBinding($data)
    {
        $userId = Authentication::getInstance()->getUser()->getUserId();
        $bindingId = Query::select('binding.bindingId','binding.status')
            ->from ('Scans scan')
            ->where('upload.userId = :userId')
            ->join('Uploads upload', "scan.uploadId = upload.uploadId", "LEFT")
            ->join('Bindings binding', "scan.bindingId = binding.bindingId", "LEFT")
            ->where('binding.status <= :reorderedStatus')
            ->execute(array('userId' => $userId, 'reorderedStatus' => Binding::STATUS_REORDERED ));
        
        if ($bindingId->getAmount()!=0)
        {
            $status = $bindingId->getFirstRow()->getValue('status');
            $bId = $bindingId->getFirstRow()->getValue('bindingId');
            return (array('status' => $status, 'bindingId' => $bId));
        }
        else
        {
            return (array('status' => Binding::STATUS_SELECTED, 'bindingId' => -1));
        }
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     * @throws BindingStatusException
     * @return multitype:unknown |multitype:number
     */
    public function actionGetBindingStatus($data)
    {
        $userId = Authentication::getInstance()->getUser()->getUserId();
        $binding = Query::select('binding.bindingId','binding.status')
            ->from ('Scans scan')
            ->where('upload.userId = :userId')
            ->join('Uploads upload', "scan.uploadId = upload.uploadId", "LEFT")
            ->join('Bindings binding', "scan.bindingId = binding.bindingId", "LEFT")
            ->where('binding.status <= :reorderedStatus')
            ->groupBy('binding.bindingId','binding.status')
            ->execute(array('userId' => $userId, 'reorderedStatus' => Binding::STATUS_REORDERED ));
        
        
        if ($binding->getAmount()===1)
        {
            $result = $binding->getFirstRow();
            $status = $result->getValue('status');
            $bindingId = $result->getValue('bindingId');
            return (array('status' => $status, 'bindingId' => $bindingId));
        }
        else if ($binding->getAmount()===0)
        {
            return (array('status' => Binding::STATUS_SELECTED, 'bindingId' => -1));
        }
        else
        {
            throw new BindingStatusException('binding-status');
        }
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     * @return boolean
     */
    public function actionUniqueLibrarySignature($data)
    {
        $libraryName = self::getString($data, 'library', '', true, 256);
        $signature = self::getString($data, 'signature', '', true, 256);
        
        
        return $this->uniqueLibrarySignature($libraryName, $signature);
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $libraryName
     * @param unknown_type $signature
     * @return boolean
     */
    public function uniqueLibrarySignature($libraryName, $signature)
    {
        $existingLibrary = LibrarySearchList::findLibraries(array('libraryName' => $libraryName),
                               null, null, null)->getFirstRow_();
        // Determine if the specified signature exists in the database already, this is not allowed.
        if ($existingLibrary)
        {
            if (BindingSearchList::findBindings(
                    array('libraryId' => $existingLibrary->getValue('libraryId')
                         ,'signature' => $signature)
                    , null, null, null)->getFirstRow_())
            {
                return false;
            }
        }
        
        return true;
    }
}
