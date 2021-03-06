<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/database/entity.php';
require_once 'framework/database/database.php';

/**
 * Class representing a scan entity.
 */
class Scan extends Entity
{
    /** Scan status constants. */
    const STATUS_PENDING    = 1; // Scan is new and waiting to be processed.
    const STATUS_PROCESSING = 2; // Scan is currently being processed.
    const STATUS_ERROR      = 3; // Processing the scan has failed.
    const STATUS_DELETED    = 6; // This scan has been deleted by the uploader or a moderator/admin.
    const STATUS_PROCESSED  = 5; // Scan is fully processed, but some settings might not be set yet.
    
    /** Scan type constants. */
    const TYPE_JPEG = "jpeg";
    const TYPE_TIFF = "tiff";
    
    /** The Id of this scan. */
    protected $scanId;
    
    /** The type of this scan. */
    protected $scanType;
    
    /** The page number of this scan. */
    protected $page;
    
    /** The status of this scan. */
    protected $status;
    
    /** The width of this scan. */
    protected $width;
    
    /** The height of this scan. */
    protected $height;
    
    /** The maximum zoom level of this scan. */
    protected $zoomLevel;
    
    /** The filename of this scan. */
    protected $scanName;
    
    /** The Id of the upload corresponding to this scan. */
    protected $uploadId;
    
    /** The Id of the binding to which this scan belongs. */
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
    
    /**
     * Returns all the books belonging to one binding
     *
     * @param $binding  The binding model
     * @return  Array of scan models
     */
    public static function fromBinding($binding)
    {
        $sorters = array('page' => 'ASC');
        $scans = ScanList::find(
            array('bindingId' => $binding->getBindingId()), 0, null, $sorters)->getEntities();
        return $scans;
    }
    
    /**
     * Returns all the scans of a certain page range which belong to one binding
     *
     * @param $binding  The binding model
     * @param $range    The page range
     * @return  Array of scan models
     */
    public static function fromBindingPage($binding, $range)
    {
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
      
       return Database::getInstance()->doTransaction(function() use ($binding, $from, $to)
       {
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
       });
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
        return array('scanType', 'page', 'status', 'width', 'height',
            'zoomLevel', 'uploadId', 'bindingId', 'scanName');
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
            'scanType'  => 'istring',
            'page'      => 'int',
            'status'    => 'int',
            'width'     => 'int',
            'height'    => 'int',
            'zoomLevel' => 'int',
            'uploadId'  => 'int',
            'bindingId' => 'int',
            'scanName'  => 'istring'
        );
    }
    
    public static function getLocation($scanId)
    {
        // TODO: find scan in path.
        return '';
    }
    
    /**
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
    
    public function getBookTitle()           { return $this->bookTitle; }
    public function setBookTitle($bookTitle) { $this->bindingId = $id;  }
}
