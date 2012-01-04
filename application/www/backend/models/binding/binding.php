<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/book/booklist.php';
require_once 'models/library/library.php';

/**
 * Class representing a binding entity.
 */
class Binding extends Entity
{
    /** Binding status constants. */
    const STATUS_UPLOADED = 0,
          STATUS_REORDERED = 1,
          STATUS_SELECTED = 2;
    
    
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
    
    /** List of all scans for this book. */
    protected $scanList;
    
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
        
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected function getTableName()
    {
        return 'Bindings';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('bindingId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('libraryId', 'signature', 'summary', 'status');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                    'bindingId'        => 'int',
                    'libraryId'        => 'int',
                    'signature'        => 'string',
                    'summary'          => 'string',
                    'status'           => 'int'
        );
    }
    
    /**
     * 
     * Enter description here ...
     */
    public function saveDetails() 
    {
        // Save the book list.
        $this->bookList->setBindingId($this->bindingId);
        $this->bookList->save();
        
        // Save the scan list.
        $this->scanList->setBindingId($this->bindingId);
        $this->scanList->save();
    }
    
    public function getBindingId()         { return $this->bindingId; }
    public function setBindingId($bindingId)     { $this->bindingId = $bindingId; }
    
    public function getLibraryId() { return $this->libraryId; }
    public function setLibraryId($libraryId) { $this->libraryId = $libraryId; }
    
    public function getSignature() { return $this->signature; }
    public function setSignature($signature) { $this->signature = $signature; }
    
    public function getSummary() { return $this->summary; }
    public function setSummary($summary) { $this->summary = $summary; }

    public function getBookList()       { return $this->bookList; }
    public function setBookList($bookList) { $this->bookList = $bookList; }
    
    public function getScanList() { return $this->scanList; }
    public function setScanList($scanList) { $this->scanList = $scanList; }

    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }
}

