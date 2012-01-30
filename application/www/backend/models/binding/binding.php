<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/book/booklist.php';
require_once 'models/provenance/provenancelist.php';
require_once 'models/library/library.php';
require_once 'models/language/bindinglanguagelist.php';

/**
 * Class representing a binding entity.
 */
class Binding extends Entity
{
    /** Binding status constants. */
    const STATUS_UPLOADED  = 0,
          STATUS_REORDERED = 1,
          STATUS_SELECTED  = 2,
          STATUS_DELETED   = 3;
    
    /** Id of this binding. */
    protected $bindingId;
    
    /** Signature of the binding */
    protected $signature;
    
    /** Summary of the contents of the binding. */
    protected $summary;
    
    /** Library */
    protected $libraryId;
    
    /** Binding status */
    protected $status;
    
    /** Books for this binding. */
    protected $bookList;
    
    /** User this binding was created by. */
    protected $userId;

    /** List of all scans for this book. */
    protected $scanList;
    
    /** List of all provenances for this book. */
    protected $provenanceList;
    
    /** List of all languages of the annotations in this book. */
    protected $bindingLanguageList;
    
    /**
     * Constructs a binding by id.
     *
     * @param  $id  Id of the binding. Default (null) will create a new binding.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->bindingId = $id;
    
            $this->load();
        }
        
        $this->bookList = new BookList();
        $this->scanList = new ScanList();
        
        $this->provenanceList      = new ProvenanceList();
        $this->bindingLanguageList = new BindingLanguageList();
    }
    
    /**
     * Loads all associtated entity lists.
     */
    public function loadDetails()
    {
        $this->bookList = BookList::find(array('bindingId' => $this->bindingId));
        $this->scanList = ScanList::find(array('bindingId' => $this->bindingId));
        $this->provenanceList = ProvenanceList::find(array('bindingId' => $this->bindingId));
        $this->bindingLanguageList = BindingLanguageList::find(array('bindingId' => $this->bindingId));
    }
    
    /**
     * Saves all associated entity lists.
     */
    public function saveDetails() 
    {
        // Save the book list.
        $this->bookList->setValue('bindingId', $this->bindingId);
        $this->bookList->save();
        
        // Load all book details.
        foreach($this->bookList as $book)
        {
            $book->loadDetails();    
        }
        
        // Save the scan list.
        $this->scanList->setValue('bindingId', $this->bindingId);
        $this->scanList->save();
        
        // Save the provenance list.
        $this->provenanceList->setValue('bindingId', $this->bindingId);
        $this->provenanceList->save();
        
        // Save the language list.
        $this->bindingLanguageList->setValue('bindingId', $this->bindingId);
        $this->bindingLanguageList->save();
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Bindings';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('bindingId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('libraryId', 'signature', 'summary', 'status', 'userId');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'bindingId' => 'int',
            'libraryId' => 'int',
            'signature' => 'string',
            'summary'   => 'string',
            'status'    => 'int',
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getBindingId()           { return $this->bindingId;       }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getLibraryId()           { return $this->libraryId;       }
    public function setLibraryId($libraryId) { $this->libraryId = $libraryId; }
    
    public function getSignature()           { return $this->signature;       }
    public function setSignature($signature) { $this->signature = $signature; }
    
    public function getSummary()         { return $this->summary;     }
    public function setSummary($summary) { $this->summary = $summary; }
    
    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }

    public function getBookList()          { return $this->bookList;      }
    public function setBookList($bookList) { $this->bookList = $bookList; }
    
    public function getScanList()          { return $this->scanList;      }
    public function setScanList($scanList) { $this->scanList = $scanList; }
    
    public function getProvenanceList()                { return $this->provenanceList;            }
    public function setProvenanceList($provenanceList) { $this->provenanceList = $provenanceList; }
    
    public function getBindingLanguageList()                     { return $this->bindingLanguageList;                 }
    public function setBindingLanguageList($bindingLanguageList) { $this->bindingLanguageList = $bindingLanguageList; }
    
    public function getUserId()                     { return $this->userId; }
    public function setUserId($userId)              { $this->userId = $userId; }
}
