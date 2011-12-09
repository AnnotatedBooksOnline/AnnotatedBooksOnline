<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a scan entity.
 */
class Scan extends Entity
{
    /** Scan status constants. */
    const STATUS_AVAILABLE = 0;
    const STATUS_ENQUEUED = 1;
    const STATUS_PROCESSING = 2;
    const STATUS_ERROR = 3;
    const STATUS_DELETED = 4;
    
    protected $scanId;
    protected $bookId;
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
    
    //TODO
    
    
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
        return array('bookId', 'page', 'status', 'width', 'height', 'zoomLevel');
    }
    
    
    // Getters and setters.
    public function getId() {return $scanId;}
    public function setId($id) {$this->scanId = $id;}
    
    public function getBookId() {return $bookId;}
    public function setBookId($id) {$this->bookId = $id;}
    
    public function getPage() {return $page;}
    public function setPage($page) {$this->page = $page;}
    
    public function getStatus() {return $status;}
    public function setStatus($s) {$this->status = $s;}
    
    public function getWidth() {return $this->width;}
    public function getHeight() {return $this->height;}
    public function setDimensions($width, $height){$this->width = $width; $this->height = $height;}
    
    public function getZoomLevel() {return $this->zoomLevel;}
    public function setZoomLevel($z) {$this->zoomLevel = $z;}
}