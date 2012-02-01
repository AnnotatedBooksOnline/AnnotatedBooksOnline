<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/upload/upload.php';
require_once 'models/book/book.php';
require_once 'models/book/booklist.php';
require_once 'models/binding/binding.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/library/library.php';
require_once 'models/library/librarylist.php';
require_once 'models/person/person.php';
require_once 'models/person/personlist.php';
require_once 'models/provenance/provenance.php';
require_once 'models/scan/scan.php';
require_once 'models/language/bindinglanguage.php';
require_once 'models/language/booklanguage.php';

/** Minimum scan width */
define(MIN_SCAN_SIZE_X, 256);

/** Minimum scan height */
define(MIN_SCAN_SIZE_Y, 256);

/**
 * Exceptions.
 */
class BindingStatusException extends ExceptionBase { }

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
        $inputScans     = self::getArray($data, 'scans');
        $inputBinding   = self::getArray($data, 'binding');
        $inputBooks     = self::getArray($data,'books');
        $inputBindingId = self::getInteger($inputBinding, 'bindingId');
        
        // Find the name of the library the binding belongs to.
        $libraryName = $inputBinding['library'];
        $signature   = self::getString($inputBinding, 'signature');
        
        // Load an existing binding or create a new binding if no existing binding is provided.
        $binding;
        if ($inputBindingId == -1)
        {
            $binding = new Binding();
        }
        else 
        {
            // Assert the user has permission to modify bindings.
            Authentication::assertPermissionTo('change-book-info');
            
            // Load the existing binding with all its attribute entities.
            $binding = new Binding($inputBindingId);
            $binding->loadDetails();
        }
        
        // Determine if the specified signature exists in the database already, this is not allowed.
        if (!$this->uniqueLibrarySignature($libraryName, $signature, $inputBindingId))
        {
            throw new ControllerException('duplicate-binding');
        }
        
        // Fill the binding attributes.
        $binding->setSummary(self::getString($inputBinding, 'summary'));
        $binding->setSignature($signature);
        $binding->setStatus(Binding::STATUS_UPLOADED);
        $binding->setUserId(Authentication::getInstance()->getUserId());
        
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
        
        return (array('bindingId' => $binding->getBindingId()));
    }
    
    /**
     * Creates a new library.
     */
    private function createLibrary($libraryName, $binding)
    {
        // Find the specified library in the database.
        $existingLibrary = LibraryList::find(array('libraryName' => $libraryName))->tryGet(0);
        
        // Determine if the library exists in the database. If this is the case the new binding should link to it. If not
        // the library needs to be created.
        if ($existingLibrary !== null)
        {
            // Make the new binding link to the existing library.
            $binding->setLibraryId($existingLibrary->getLibraryId());
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
     * Creates all the binding's books.
     */
    private function createBooks($inputBooks, $binding)
    {
        // Mark all books for deletion temporarily. This flag will be restored for some books later.
        $binding->getBookList()->markAllAsDeleted(true);
        
        // Iterate over all books in the input.
        foreach ($inputBooks as $inputBook)
        {
            // Load an existing book or create a new book if no existing binding is provided.
            $inputBookId = self::getInteger($inputBook, 'bookId');
            if ($inputBookId == -1) 
            {
                $book = new Book();
            }
            else
            {
                // Retrieve the book to be modified from the existing binding.
                $book = $binding->getBookList()->getByKeyValue('bookId', $inputBookId);                
                if ($book == null) 
                {
                    throw new ControllerException('invalid-book-id-provided');
                }
            }
            
            // Fill the book attributes with information from the request.
            $book->setTitle(self::getString($inputBook, 'title'));
            $book->setMinYear(self::getInteger($inputBook, 'minYear'));
            $book->setMaxYear(self::getInteger($inputBook, 'maxYear'));
            $book->setPreciseDate(self::getString($inputBook, 'preciseDate'));
            $book->setPlacePublished(self::getString($inputBook, 'placePublished'));
            $book->setPublisher(self::getString($inputBook, 'publisher'));
            $book->setPrintVersion(self::getString($inputBook, 'printVersion'));
            
            // Create the book authors.
            $this->createAuthors($inputBook, $book);
            
            // Create the book languages.
            $this->createBookLanguages($inputBook, $book);
            
            // Markt the book as updated so it will be updated or inserted into the database.
            $book->setMarkedAsUpdated(true);
            $book->setMarkedAsDeleted(false);
            
            // Add the book to the binding.
            $binding->getBookList()->add($book);
        }
    }
    
    /**
     * Creates the scans belonging to this binding.
     */
    private function createScans($inputScans, $binding)
    {
        $pageNumber = 1;
        
        // Create scans.
        foreach ($inputScans as $inputScan)
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
            $scan->setScanName($upload->getFilename());
            
            // Identify the scan.
            $this->identifyScan($scan, $upload);
            
            // Add the scan to the bindning.
            $binding->getScanList()->add($scan);
        }
    }
    
    /**
     * Creates all the links between books and languages.
     */
    private function createBookLanguages($inputBook, $book)
    {

        // Mark all book languages for deletion. Booklanguageses that should remain will be unmarked later.
        $book->getBookLanguageList()->markAllAsDeleted(true);
        
        // Iterate over all languages for the book.
        foreach(self::getArray($inputBook, 'languages') as $languageId)
        {
            // Determine if the book language exists already.
            $existingBookLanguage = $book->getBookLanguageList()->getByKeyValue('languageId', $languageId);
            if ($existingBookLanguage)
            {
                // Prevent this language from being deleted.
                $existingBookLanguage->setMarkedAsDeleted(false);
            }
            else
            {
                // Create the book language and add it to the list.
                $existingBookLanguage = new BookLanguage();
                $existingBookLanguage->setLanguageId($languageId);
                 
                $book->getBookLanguageList()->add($existingBookLanguage);
            }
        }
    }
    
    /**
    * Creates all the languages of annotations linked to the binding.
    */
    private function createBindingAnnotationLanguages($inputBinding, $binding)
    {
        // Mark all binding languages for deletion. Binding languages that should remain will be unmarked later.
        $binding->getBindingLanguageList()->markAllAsDeleted(true);
        
        // Iterate over all languages for the binding.
        foreach(self::getArray($inputBinding, 'languagesofannotations') as $languageId)
        {
            // Determine if the binding language exists already.
            $existingBindingLanguage = $binding->getBindingLanguageList()->getByKeyValue('languageId', $languageId);
            if ($existingBindingLanguage)
            {
                // Prevent this binding language from being deleted.
                $existingBindingLanguage->setMarkedAsDeleted(false);
            }
            else
            {
                // Create the binding language and add it to the list.
                $bindingLanguage = new BindingLanguage();
                $bindingLanguage->setLanguageId($languageId);
                
                $binding->getBindingLanguageList()->add($bindingLanguage);
            }
        }
    }
    
    /**
     * Creates all the authors of the book.
     */
    private function createAuthors($inputBook, $book)
    {
        // Mark all provenances for deletion. Provenances that should remain will be unmarked later.
        $book->getAuthorList()->markAllAsDeleted(true);
        
        // Split all persons in the provenance.
        $authorPersonNames = array_map("trim", explode(',', self::getString($inputBook, 'author'))); 
        
        // Create all provenances.
        foreach($authorPersonNames as $authorPersonName)
        {
            if ($authorPersonName == "") 
            {
                continue;
            }
            
            // Create the person for the provenance.
            $person = $this->createPerson($authorPersonName);
    
            // Determine if the provenance exists already.
            $existingAuthor = $book->getAuthorList()->getByKeyValue('personId', $person->getPersonId());
            if ($existingAuthor)
            {
                // Prevent this provenance from being deleted.
                $existingAuthor->setMarkedAsDeleted(false);
            }
            else
            {
                // Create the provenance associating the binding with the person.
                $author = new Author();
                $author->setPersonId($person->getPersonId());
    
                // Add the provenance to the binding.
                $book->getAuthorList()->add($author);
            }
        }
    }
    
    /**
     * Creates all the provenances of the binding.
     */
    private function createProvenances($inputBinding, $binding)
    {
        // Mark all provenances for deletion. Provenances that should remain will be unmarked later.
        $binding->getProvenanceList()->markAllAsDeleted(true);
        
        // Split all persons in the provenance.
        $provenancePersonNames = array_map("trim", explode(',', self::getString($inputBinding, 'provenance'))); 
        
        // Create all provenances.
        foreach($provenancePersonNames as $provenancePersonName)
        {
            // Skip empty provenances.
            if ($provenancePersonName == "")
            {
                continue;
            }
            
            // Find or create the person for the provenance.
            $person = $this->createPerson($provenancePersonName);
            
            // Determine if the provenance exists already.
            $existingProvenance = $binding->getProvenanceList()->getByKeyValue('personId', $person->getPersonId());
            if ($existingProvenance)
            {
                // Prevent this provenance from being deleted.
                $existingProvenance->setMarkedAsDeleted(false);
            }
            else
            {
                // Create the provenance associating the binding with the person.
                $provenance = new Provenance();
                $provenance->setPersonId($person->getPersonId());
                
                // Add the provenance to the binding.
                $binding->getProvenanceList()->add($provenance);
            }
        }    
    }
    
    /**
     * Creates a person.
     */
    private function createPerson($personName)
    {
        Log::info("!!PersonNAME " . $personName);
        $existingPerson = PersonList::find(array('name' => $personName))->tryGet(0);
        
        if ($existingPerson !== null)
        {
            return new Person($existingPerson->getPersonId());
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
     * Links a scan to an upload.
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
        
        if ($scanUploadImageIdentification[0] < MIN_SCAN_SIZE_X
            || $scanUploadImageIdentification[1] < MIN_SCAN_SIZE_Y)
        {
            throw new ControllerException('image-too-small');
        }
        
        $columns = $scanUploadImageIdentification[0] / 256; // TODO: Constant!
        $rows    = $scanUploadImageIdentification[1] / 256; // TODO: Constant!
        
        $maxZoomLevel = ceil(log(max($columns, $rows), 2));
        
        $scan->setZoomLevel($maxZoomLevel + 1);
        
        // Determine image dimensions.
        $minification = pow(2, $maxZoomLevel);
        $scan->setDimensions(ceil($scanUploadImageIdentification[0] / $minification),
                             ceil($scanUploadImageIdentification[1] / $minification));
    }
    
    /**
     * Unnecessary
     */
    public function actionGetBindingStatus($data)
    {
        $userId = Authentication::getInstance()->getUserId();
        $binding = Query::select('bindingId','status')
            ->from ('Bindings')
            ->where('status <= :reorderedStatus', 'userId = :userId')
            ->execute(array('userId' => $userId, 'reorderedStatus' => Binding::STATUS_REORDERED ));
        
        if ($binding->getAmount() === 1)
        {
            $result = $binding->getFirstRow();
            $status = $result->getValue('status');
            $bindingId = $result->getValue('bindingId');
            return (array('status' => $status, 'bindingId' => $bindingId));
        }
        else if ($binding->getAmount() === 0)
        {
            return (array('status' => Binding::STATUS_SELECTED, 'bindingId' => -1));
        }
        else
        {
            throw new BindingStatusException('binding-status');
        }
    }
    
    /**
     * Returns whether the combination of library and signature in the sent data is unique.
     */
    public function actionUniqueLibrarySignature($data)
    {
        $libraryName = self::getString($data, 'library', '', true, 256);
        $signature   = self::getString($data, 'signature', '', true, 256);
        $bindingId   = self::getInteger($data, 'bindingId');
        
        return $this->uniqueLibrarySignature($libraryName, $signature, $bindingId);
    }
    
    /**
     * Returns whether the inputcombination of library and signature is unique.
     */
    public function uniqueLibrarySignature($libraryName, $signature, $bindingId)
    {
        // Find the library.
        $existingLibrary = LibraryList::find(array('libraryName' => $libraryName))->tryGet(0);
        
        // Determine if this is a new library, if this is the case the signature is valid.
        if ($existingLibrary === null)
        {
            return true;
        }
        
        // Find an existing binding for the library and the specified signature
        $binding = BindingList::find(array(
                    'libraryId' => $existingLibrary->getLibraryId(),
                    'signature' => $signature))->tryGet(0);
                    
        // Determine if there is an existing binding and if this is not the binding currently being
        // modified.
        if ($binding !== null && $binding->getBindingId() != $bindingId)
        {
            return false;
        }
        else
        {
            return true;
        }
    }
    
    
    /**
     * Deletes a binding.
     */
    public function actionDeleteUpload($data)
    {
        Authentication::assertPermissionTo('upload-bindings');  
        $userId = Authentication::getInstance()->getUserId();
        $inputBindingId = self::getInteger($data, 'bindingId');
        $binding = new Binding($inputBindingId);
        if (($binding->getStatus() != 2) && ($binding->getUserId() == $userId))
            {
                $binding->setStatus(Binding::STATUS_DELETED);
                $binding->save();
            }
        else
        {
            throw new ControllerException('deleting-not-allowed');
        }
    }
}
