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
    // const STATUS_AVAILABLE  = 0; // Scan is available and viewable.
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
    protected $scanType;
    protected $page;
    protected $status;
    protected $width;
    protected $height;
    protected $zoomLevel;
    protected $scanName;
    protected $uploadId;
    protected $bindingId;
    
    /** Joined attributes. */
    protected $bookTitle;

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
    
    public static function fromBinding($binding)
    {
        // TODO: Use scan list here.
        
        $result = Query::select('scanId')
            ->from('Scans')
            ->where('bindingId = :binding')
            ->orderBy('page', 'ASC')
            ->execute(array('binding' => $binding->getBindingId()));
            
        $scans = array();
        
        foreach ($result as $scan)
        {
            $scans[] = new Scan($scan->getValue('scanId'));
        }
        
        return $scans;
    }
    
    public static function fromBindingPage($binding, $range)
    {
        // TODO: Use scan list here.
        
        if (is_array($range))
        {
            $from = $range[0];
            $to   = $range[1];
        }
        else
        {
            $from = $range;
            $to   = $range;
        }
        
        $result = Query::select('scanId')
            ->from('Scans')
            ->where('bindingId = :binding', 'page >= :from', 'page <= :to')
            ->orderBy('page', 'ASC')
            ->execute(array(
                'binding' => $binding->getBindingId(),
                'from'    => $from,
                'to'      => $to
            ));
            
        $scans = array();
        foreach ($result as $scan)
        {
            $scans[] = new Scan($scan->getValue('scanId'));
        }
        
        return $scans;
    }
    
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
        return array('scanType', 'page', 'status', 'width', 'height', 'zoomLevel', 'uploadId', 'bindingId', 'scanName');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'scanId'    => 'int',
            'scanType'  => 'string',
            'page'      => 'int',
            'status'    => 'int',
            'width'     => 'int',
            'height'    => 'int',
            'zoomLevel' => 'int',
            'uploadId'  => 'int',
            'bindingId' => 'int',
            'scanName'  => 'string'
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getScanId() { return $this->scanId; }
    
    public function getScanType()      { return $this->scanType;  }
    public function setScanType($type) { $this->scanType = $type; }
    
    public function getPage()      { return $this->page;  }
    public function setPage($page) { $this->page = $page; }
    
    public function getScanName()  { return $this->scanName; }
    public function setScanName($scanName) { $this->scanName = $scanName;}
    
    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }
    
    public function getWidth()  { return $this->width;  }
    public function getHeight() { return $this->height; }
    
    public function setDimensions($width, $height)
    {
        $this->width  = $width;
        $this->height = $height;
    }
    
    public function getZoomLevel()       { return $this->zoomLevel;   }
    public function setZoomLevel($level) { $this->zoomLevel = $level; }
    
    public function getUploadId()    { return $this->uploadId; }
    public function setUploadId($id) { $this->uploadId = $id;  }
    
    public function getBindingId()    { return $this->bindingId; }
    public function setBindingId($id) { $this->bindingId = $id;  }
    
    public function getBookTitle()    { return $this->bookTitle; }
    public function setBookTitle($bookTitle) { $this->bindingId = $id; }
}
