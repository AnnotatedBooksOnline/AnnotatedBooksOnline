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
require_once 'models/annotation/annotation.php';

class RevisedAnnotation extends Entity
{
    /** Id of this revised annotation. */
    protected $revisedAnnotationId;

    /** Id of the annotation this is a revision of. */
    protected $annotationId;

    /** The polygon of this annotation. */
    protected $polygon;

    /** The English translation of the transcribed text. */
    protected $transcriptionEng;

    /** The transcribed text. */
    protected $transcriptionOrig;


    /** The Id of the user who made this revision. */
    protected $changedUserId;

    /** The time and date on which this revision was done. */
    protected $revisionCreateTime;
    
    /** The chronological index of this revision. */
    protected $revisionNumber;
    
    /**
     * Constructs a RevisedAnnotation entity.
     *
     * @param $id Id of the revised  annotation. Default (null) will create a new one.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->revisedAnnotationId = $id;
    
            $this->load();
        }
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'RevisedAnnotations';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('revisedAnnotationId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('polygon', 'transcriptionEng', 'transcriptionOrig','changedUserId', 
                     'revisionCreateTime', 'revisionNumber', 'annotationId'); 
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
                'revisedAnnotationId' => 'int',
                'annotationId'        => 'int',
                'polygon'             => 'base64',
                'transcriptionEng'    => 'string',
                'transcriptionOrig'   => 'string',
                'changedUserId'       => 'int',
                'revisionCreateTime'  => 'timestamp',
                'revisionNumber'      => 'int'
        );
    }
    
    /**
     * Creates and stores a RevisedAnnotation based on the current content of an Annotation.
     * Should be called just before the contents of this annotation are about to be changed.
     * 
     * This annnotation may or may not already have earlier revisions. 
     * 
     * @param Annotation $annotation A fully loaded Annotation entity.
     * 
     * @return The new RevisedAnnotation entity. Is already stored.
     */
    public static function addRevised($annotation)
    {
        // Do a transaction.
        return Database::getInstance()->doTransaction(function() use ($annotation)
        {
        
            $result = new RevisedAnnotation();
            
            // Get the annotation id.
            $aid = $annotation->getAnnotationId();
            
            // Query for revision number of the latest other revisions of this annotation. 
            $lastRev = Query::select('MAX(revisionNumber) AS revisionNumber')
                                                           ->from('RevisedAnnotations')
                                                           ->where('annotationId = :aid')
                                                           ->execute(array('aid' => $aid),
                                                                     array('aid' => 'int'))
                                                           ->tryGetFirstRow();
            
            if($lastRev === null)
            {
                // This is the first revision of this annotation. 
                // Give it revisionNumber 0.
                $result->revisionNumber = 0;
            }
            else
            {
                // Set the incremented the revision number.
                $result->revisionNumber = $lastRev->getValue('revisionNumber') + 1;
            }
            
            // Set the revision creation time to the current moment.
            $result->revisionCreateTime = time();
            
            // Copy other properties from the Annotation.
            $result->annotationId = $aid;
            $result->setPolygon($annotation->getPolygon());
            $result->transcriptionEng = $annotation->getTranscriptionEng();
            $result->transcriptionOrig = $annotation->getTranscriptionOrig();
            $result->changedUserId = $annotation->getChangedUserId();
            
            // Store and return the result.
            $result->save();
            return $result;
        });
    }
    
    /**
     * Takes this revision and restores it as the current one of this annotation. 
     * Make sure this RevisedAnnotation is fully loaded before calling this.
     * 
     * All future revisions are deleted. 
     */
    public function restoreRevision()
    {
        $_this = $this;
        
        // Do a transaction.
        return Database::getInstance()->doTransaction(function() use ($_this)
        {
            // Get the corresponding Annotation.
            $annotation = new Annotation($_this->annotationId);
            
            // Write revision fields to that annotation.
            $annotation->setPolygon($_this->getPolygon());
            $annotation->setTranscriptionEng($_this->transcriptionEng);
            $annotation->setTranscriptionOrig($_this->transcriptionOrig);
            $annotation->setChangedUserId($_this->changedUserId);
            $annotation->setTimeChanged($_this->revisionCreateTime);
            
            // Delete this revision and all that come after it.
            Query::delete('RevisedAnnotations')
                 ->where('revisionNumber >= :number')
                 ->execute(array('number' => $_this->revisionNumber),
                           array('number' => 'int'));
            
            // Store the updated annotation.
            $annotation->save();
        });
    }
    
    
    // Getters and setters.
    
    public function getRevisedAnnotationId()    { return $this->revisedAnnotationId; }
    public function setRevisedAnnotationId($id) { $this->revisedAnnotationId = $id;  }

    public function getAnnotationId()    { return $this->annotationId; }
    public function setAnnotationId($id) { $this->annotationId = $id;  }
    
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
    
    
    public function getChangedUserId()    { return $this->changedUserId; }
    public function setChangedUserId($id) { $this->changedUserId = $id;  }
    
    public function getRevisionCreateTime() 
    {
        return date('Y-m-d',$this->revisionCreateTime);
    }
    public function setRevisionCreateTime($time) { $this->revisionCreateTime = $time; }
    
    public function getRevisionNumber()     { return $this->revisionNumber; }
    public function setRevisionNumber($num) { $this->revisionNumber = num;  }
}