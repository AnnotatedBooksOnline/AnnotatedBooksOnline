<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'framework/database/database.php';
require_once 'models/scan/scan.php';

/**
 * Class representing an annotation entity.
 */
class Annotation extends Entity
{
    /** Fields. */
    protected $annotationId;
    protected $scanId;
    protected $polygon;
    protected $transcriptionEng;
    protected $transcriptionOrig;
    protected $userId;
    protected $timeCreated;
    protected $order;
    
    /**
     * Constructs an annotation entity.
     *
     * @param $id  Id of the annotation. Default (null) will create a new annotation.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->annotationId = $id;
            
            $this->load();
        }
    }
    
    public static function fromScan($scan)
    {
        // TODO: Use AnnotationList.
        
        $result = Query::select('annotationId')
            ->from('Annotations')
            ->where('scanId = :scan')
            ->execute(array(
                'scan' => $scan->getScanId()
            ));
            
        $annotations = array();
        foreach($result as $annotation)
        {
            $annotations[] = new Annotation($annotation->getValue('annotationId'));
        }
        
        return $annotations;
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'Annotations';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('annotationId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('scanId', 'polygon', 'transcriptionEng', 'transcriptionOrig', 'userId', 'timeCreated', 'order');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'annotationId'      => 'int',
            'scanId'            => 'int',
            'polygon'           => 'base64',
            'transcriptionEng'  => 'string',
            'transcriptionOrig' => 'string',
            'userId'            => 'int',
            'timeCreated'       => 'timestamp',
            'order'             => 'int'
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getAnnotationId()    { return $this->annotationId; }
    public function setAnnotationId($id) { $this->annotationId = $id; } 
    
    public function getScanId()        { return $this->scanId;    }
    public function setScanId($scanId) { $this->scanId = $scanId; }
    
    public function getTranscriptionEng()      { return $this->transcriptionEng;  }
    public function setTranscriptionEng($text) { $this->transcriptionEng = $text; }
    
    public function getTranscriptionOrig()      { return $this->transcriptionOrig;  }
    public function setTranscriptionOrig($text) { $this->transcriptionOrig = $text; }
    
    public function getPolygon()
    {
        return array_map(function($vertex)
        {
            return array(
                'x' => $vertex[0],
                'y' => $vertex[1]
            );
        }, array_chunk(unpack('f*', $this->polygon), 2));
    }
    
    public function setPolygon($vertices)
    {
        $this->polygon = '';
        foreach ($vertices as $vertex)
        {
            $this->polygon .= pack('f2', $vertex['x'], $vertex['y']);
        }
    }
    
    public function getUserId()    { return $this->userId; }
    public function setUserId($id) { $this->userId = $id;  }
    
    public function getTimeCreated()      { return $this->timeCreated;  }
    public function setTimeCreated($time) { $this->timeCreated = $time; }
    
    public function getOrder()       { return $this->order;   }
    public function setOrder($order) { $this->order = $order; }
}

