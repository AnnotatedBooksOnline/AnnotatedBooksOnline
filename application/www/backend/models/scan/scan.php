<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/database.php';

/**
 * Class representing a scan entity.
 */
class Scan extends Entity
{
    /** Scan status constants. */
    const STATUS_AVAILABLE  = 0; // Scan is available and viewable.
    const STATUS_PENDING    = 1; // Scan is new and waiting to be processed.
    const STATUS_PROCESSING = 2; // Scan is currently being processed.
    const STATUS_ERROR      = 3; // Processing the scan has failed.
    const STATUS_DELETED    = 4; // This scan has been deleted by the uploader or a moderator/admin.
    const STATUS_PROCESSED  = 5; // Scan is fully processed, but some settings might not be set yet.
    
    /** Scan type constants. */
    const TYPE_JPEG = "jpeg";
    const TYPE_TIFF = "tiff";
    
    /** Table attributes. */
    protected $scanId;
    protected $bookId;
    protected $scanType;
    protected $page;
    protected $status;
    protected $width;
    protected $height;
    protected $zoomLevel;

    /**
     * Constructs a scan entity.
     *
     * @param $id  Id of the scan. Default (null) will create a new scan.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->scanId = $id;
            $this->load();
        }
    }
    
    /**
     * Creates a new empty scan with its status set to enqueued and saves it.
     * 
     * @param $scanType The image type of the input image, should be either "tiff" or "jpeg". 
     * 
     * @return The entity of the newly created scan, which is saved and therefor has its primary 
     *         key set.
     */
    public static function createEmptyScan($scanType)
    {
        $scan = new Scan();
        
        // Uninitialized variables will, when inserted using the query builder, be treated as NULL.
        $scan->status   = Scan::STATUS_PENDING; 
        $scan->scanType = $scanType;
        $scan->save();
        
        return $scan;
    }
    
    public static function fromBook($book)
    {
        $result = Query::select('scanId')
            ->from('Scans')
            ->where('bookId = :book')
            ->orderBy('page', 'ASC')
            ->execute(array(':book' => $book->getBookId()));
            
        $scans = array();
        
        foreach($result as $scan)
        {
            $scans[] = new Scan($scan->getValue('scanId'));
        }
        return $scans;
    }
    
    // TODO: Add more helpers.
    
    /**
     * Get the name of the corresponding table.
     */
    public function getTableName()
    {
        return 'Scans';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public function getPrimaryKeys()
    {
        return array('scanId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public function getColumns()
    {
        return array('bookId', 'scanType', 'page', 'status', 'width', 'height', 'zoomLevel');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'bookId'    => 'int',
            'scanType'  => 'string',
            'page'      => 'int',
            'status'    => 'int',
            'width'     => 'int',
            'height'    => 'int',
            'zoomLevel' => 'int',
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getScanId() { return $this->scanId; }
    
    public function getBookId()    { return $this->bookId; }
    public function setBookId($id) { $this->bookId = $id;  }
    
    public function getScanType()      { return $this->scanType;  }
    public function setScanType($type) { $this->scanType = $type; }
    
    public function getPage()      { return $this->page;  }
    public function setPage($page) { $this->page = $page; }
    
    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }
    
    public function getWidth()  { return $this->width;  }
    public function getHeight() { return $this->height; }
    
    public function getFileName()  { return $this->fileName; }
    public function setFileName($fileName) { $this->fileName = $fileName; }
    
    
    public function setDimensions($width, $height)
    {
        $this->width  = $width;
        $this->height = $height;
    }
    
    public function getZoomLevel()       { return $this->zoomLevel;   }
    public function setZoomLevel($level) { $this->zoomLevel = $level; }
}
