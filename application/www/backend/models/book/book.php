<?php 
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/scan/scanlist.php';
require_once 'models/binding/binding.php';


/**
 * Class representing a book entity.
 */
class Book extends Entity
{

    
    /** Id of this book. */
    protected $bookId;
    
    /** Title of this book. */
    protected $title;
    
    /** Binding identifier of the binding this book is part of. */
    protected $bindingId;
    
    /** Minimum year of publication. */
    protected $minYear;
    
    /** Maximum year of publication. */
    protected $maxYear;
    
    /** Precise date of publication. */
    protected $preciseDate;
    
    /** Place of publication. */
    protected $placePublished;
    
    /** Publisher of the book. */
    protected $publisher;
    
    /** Version of the book. */
    protected $printVersion;
    
    protected $firstPage;
    protected $lastPage;
    
    /**
    * Constructs a book by id.
    *
    * @param  $id  Id of the book. Default (null) will create a new book.
    */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->bookId = $id;
    
            $this->load();
        }
        
    }
    
    public static function fromBinding($binding)
    {
        $result = Query::select('bookId')
            ->from('Books')
            ->where('bindingId = :binding')
            ->orderBy('firstPage', 'ASC')
            ->execute(array(
                ':binding' => $binding->getBindingId()
            ));
            
        $books = array();
        
        foreach($result as $book)
        {
            $books[] = new Book($book->getValue('bookId'));
        }
        return $books;
    }
    
    public static function fromBindingPage($binding, $range)
    {
        if (is_array($range))
        {
            $from = $range[0];
            $to = $range[1];
        }
        else
        {
            $from = $range;
            $to = $range;
        }
        
        $result = Query::select('bookId')
            ->from('Books')
            ->where('bindingId = :binding', 'lastPage >= :from', 'firstPage <= :to')
            ->orderBy('firstPage', 'ASC')
            ->execute(array(
                ':binding' => $binding->getBindingId(),
                ':from' => $from,
                ':to' => $to
            ));
            
        $books = array();
        
        foreach($result as $book)
        {
            $books[] = new Book($book->getValue('bookId'));
        }
        return $books;
    }
    
    /**
    * Gets the table name.
    *
    * @return  The table name.
    */
    protected function getTableName()
    {
        return 'Books';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('bookId');
    }
            
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('title', 'bindingId', 'minYear', 'maxYear',
                     'preciseDate', 'placePublished', 'publisher', 'printVersion',
                     'firstPage', 'lastPage');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
                'bookId'           => 'int',
                'title'            => 'string',
                'bindingId   '     => 'int',
                'minYear'          => 'int',
                'maxYear'          => 'int',
                'preciseDate'      => 'date',
                'placePublished'   => 'string',
                'publisher'        => 'string',
                'printVersion'     => 'integer',
                'firstPage'        => 'int',
                'lastPage'         => 'int'
        );
    }
    
    /**
     *
     * Enter description here ...
     */
    public function saveDetails()
    {
        ;
    }
 
    
    public function getBookId()         { return $this->bookId; }
    public function setBookId($bookId)  { $this->bookId = $bookId; }
    
    public function getTitle() { return $this->title; }
    public function setTitle($title) { $this->title = $title; }
    
    public function getBindingId() { return $this->bindingId; }
    public function setBindingId($bindingId) { $this->bindingId = $bindingId; }
    
    public function getMinYear()       { return $this->minYear; }
    public function setMinYear($minYear) { $this->minYear = $minYear; }
    
    public function getMaxYear()       { return $this->maxYear; }
    public function setMaxYear($maxYear) { $this->maxYear = $maxYear; }
    
    public function getPreciseDate()       { return $this->preciseDate; }
    public function setPreciseDate($preciseDate) { $this->preciseDate = $preciseDate; }
    
    public function getPlacePublished()       { return $this->placePublished; }
    public function setPlacePublished($placePublished) { $this->placePublished = $placePublished; }
    
    public function getPublisher()       { return $this->publisher; }
    public function setPublisher($publisher) { $this->publisher = $publisher; }
    
    public function getPrintVersion()       { return $this->printVersion; }
    public function setPrintVersion($printVersion) { $this->printVersion = $printVersion; }
    
    public function getFirstPage() { return $this->firstPage; }
    public function setFirstPage($page) { $this->firstPage = $page; }
    
    public function getLastPage() { return $this->lastPage; }
    public function setLastPage($page) { $this->lastPage = $page; }
}

