<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a scan entity.
 */
class Scan extends Entity
{
    /** Scan status constants. */
    const STATUS_AVAILABLE = 0;  // Scan is available and viewable.
    const STATUS_PENDING = 1;    // Scan is new and waiting to be processed. 
    const STATUS_PROCESSING = 2; // Scan is currently being processed.
    const STATUS_ERROR = 3;      // Processing the scan has failed.
    const STATUS_DELETED = 4;    // This scan has been deleted by the uploader or a moderator/admin.
    const STATUS_PROCESSED = 5;  // Scan is fully processed, but some settings might not be set yet.
    
    /** ScanType constants. */
    const IMGTYPE_JPEG = "jpeg";
    const IMGTYPE_TIFF = "tiff";
    
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
    * @param $sid If null, an empty entity will be created. Otherwise one with the provided scanId
    *             will be loaded.
    */
    public function __construct($sid = null)
    {
        if($sid !== null)
        {
            $this->load();
        }
    }
    
    /**
     * Creates a new empty scan with its status set to STATUS_ENQUEUED and saves it.
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
        $scan->status = Scan::STATUS_PENDING; 
        $scan->scanType = $scanType;
        $scan->save();
        
        return $scan;
    }
    
    // TODO: more helpers.
    
    /**
    * Get the name of the corresponding table.
    */
    public static function getTableName()
    {
        return 'Scans';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('scanId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('bookId', 'scanType', 'page', 'status', 'width', 'height', 'zoomLevel');
    }
    
    
    // Getters and setters.
    public function getId() {return $this->scanId;}
    public function setId($id) {$this->scanId = $id;}
    
    public function getBookId() {return $this->bookId;}
    public function setBookId($id) {$this->bookId = $id;}
    
    public function getScanType() {return $this->scanType;}
    public function setScanType($type) {$this->scanType = $type;}
    
    public function getPage() {return $this->page;}
    public function setPage($page) {$this->page = $page;}
    
    public function getStatus() {return $this->status;}
    public function setStatus($s) {$this->status = $s;}
    
    public function getWidth() {return $this->width;}
    public function getHeight() {return $this->height;}
    public function setDimensions($width, $height){$this->width = $width; $this->height = $height;}
    
    public function getZoomLevel() {return $this->zoomLevel;}
    public function setZoomLevel($z) {$this->zoomLevel = $z;}
}