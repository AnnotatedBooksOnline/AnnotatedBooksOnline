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
    protected $annotationId;
    protected $scanId;
    protected $polygon;
    protected $transcriptionEng;
    protected $transcriptionOrig;

    
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
        $result = Query::select('annotationId')
            ->from('Annotations')
            ->where('scanId = :scan')
            ->execute(array(
                ':scan' => $scan->getScanId()
            ));
            
        $annotations = array();
        
        foreach($result as $annotation)
        {
            $annotations[] = new Annotation($annotation->getValue('annotationId'));
        }
        return $annotations;
    }
    
    // TODO: Add more helpers.
    
    /**
     * Get the name of the corresponding table.
     */
    public function getTableName()
    {
        return 'Annotations';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public function getPrimaryKeys()
    {
        return array('annotationId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public function getColumns()
    {
        return array('scanId', 'polygon', 'transcriptionEng', 'transcriptionOrig');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'annotationId'      => 'int',
            'scanId'            => 'int',
            'polygon'           => 'lob',
            'transcriptionEng'  => 'string',
            'transcriptionOrig' => 'string'
        );
    }
    
    /*
     * Getters and setters.
     */
    public function getannotationId() { return $this->annotationId; }
    public function getScanId() { return $this->scanId; }
    public function setScanId($scanId) { $this->scanId = $scanId; }
    public function getTranscriptionEng() { return $this->transcriptionEng; }
    public function setTranscriptionEng($text) { $this->transcriptionEng = $text; }
    public function getTranscriptionOrig() { return $this->transcriptionOrig; }
    public function setTranscriptionOrig($text) { $this->transcriptionOrig = $text; }
    public function getPolygon()
    {
        return array_map(function($coord)
        {
            return array(
                'x' => $coord[0],
                'y' => $coord[1]
            );
        }, array_chunk(unpack('f*', $this->polygon), 2));
    }
    public function setPolygon($arr)
    {
        $this->polygon = '';
        foreach ($arr as $coord)
        {
            $this->polygon .= pack('f2', $coord['x'], $coord['y']);
        }
    }
}

