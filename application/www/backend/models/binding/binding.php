<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/book/booklist.php';

/**
 * Class representing a binding entity.
 */
class Binding extends Entity
{
    
    /** Id of this binding. */
    protected $bindingId;
    
    /** Library this binding belongs to. */
    protected $libraryId;
    
    /** Signature of the binding */
    protected $signature;
    
    /** Summary of the contents of the binding. */
    protected $summary;
    
    /** Number of pages to first page of the binding. */
    protected $pagesToFirst;
    
    /** Number of pages to the last page of the binding. */
    protected $pagesFromLast;
    
    /** Books for this binding. */
    protected $bookList;
    
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
        
        $bookList = new BookList();
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
        return array('bindingId', 'libraryId', 'signature', 'summary', 'pagesToFirst',
                         'pagesFromLast');
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
                    'pagesToFirst'     => 'int',
                    'pagesFromLast'    => 'int'
        );
    }
    
    /**
     * 
     * Enter description here ...
     */
    public function saveDetails() 
    {
        
        // Save the book list.
        $bookList->setBindingId($bindingId);
        $bookList->save();
        
    }
    
    public function getBindingId()         { return $this->bindingId; }
    public function setBindingId($bindingId)     { $this->bindingId = $bindingId; }
    
    public function getLibraryId() { return $this->libraryId; }
    public function setLibraryId($libraryId) { $this->libraryId = $libraryId; }
    
    public function getSignature() { return $this->signature; }
    public function setSignature($signature) { $this->signature = $signature; }
    
    public function getSummary() { return $this->summary; }
    public function setSummary($summary) { $this->summary = $summary; }

    public function getPagesToFirst()       { return $this->pagesToFirst; }
    public function setPagesToFirst($pagesToFirst) { $this->pagesToFirst = $pagesToFirst; }
    
    public function getPagesFromLast()       { return $this->pagesFromLast; }
    public function setPagesFromLast($pagesFromLast) { $this->pagesFromLast = $pagesFromLast; }
    
    public function getBookList()       { return $this->bookList; }
    public function setBookList($bookList) { $this->bookList = $bookList; }
}
