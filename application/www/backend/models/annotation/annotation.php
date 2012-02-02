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
require_once 'models/scan/scan.php';
require_once 'models/annotation/annotationlist.php';

/**
 * Class representing an annotation entity.
 */
class Annotation extends Entity
{
    /** Id of this annotation. */
    protected $annotationId;
    
    /** Id of the scan to which this annotation belongs. */
    protected $scanId;
    
    /** The polygon of this annotation. */
    protected $polygon;
    
    /** The English translation of the transcribed text. */
    protected $transcriptionEng;
    
    /** The transcribed text. */
    protected $transcriptionOrig;
    
    /** The Id of the user who created this annotation. */
    protected $createdUserId;
    
    /** The time and date on which this annotation was created. */
    protected $timeCreated;
    
    /** The position of this annotation on the list of annotation which belong to one scan. */
    protected $order;
    
    /** The Id of the user who last modified this annotation. */
    protected $changedUserId;
    
    /** the time and date on which this annotation was last modified. */
    protected $timeChanged;
    
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
    
    /**
     * Returns all the annotations which belong to one scan
     *
     * @param $scan  The scan model
     * @return  Array of annotation models
     */
    public static function fromScan($scan)
    {
        $annotations = AnnotationList::find(array('scanId' => $scan->getScanId()))->getEntities();
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
        return array('scanId', 'polygon', 'transcriptionEng', 'transcriptionOrig', 'createdUserId',
            'timeCreated', 'order', 'changedUserId', 'timeChanged');
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
            'createdUserId'     => 'int',
            'timeCreated'       => 'timestamp',
            'order'             => 'int',
            'changedUserId'     => 'int',
            'timeChanged'       => 'timestamp',
        );
    }
    
    /**
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
    
    public function getCreatedUserId()    { return $this->createdUserId; }
    public function setCreatedUserId($id) { $this->createdUserId = $id;  }
    
    public function getTimeCreated()      { return date('Y-m-d',$this->timeCreated);  }
    public function setTimeCreated($time) { $this->timeCreated = $time; }
    
    public function getOrder()       { return $this->order;   }
    public function setOrder($order) { $this->order = $order; }
    
    public function getChangedUserId()    { return $this->changedUserId; }
    public function setChangedUserId($id) { $this->changedUserId = $id;  }
    
    public function getTimeChanged()      { return date('Y-m-d',$this->timeChanged);  }
    public function setTimeChanged($time) { $this->timeChanged = $time; }
}
