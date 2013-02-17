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
    /** Mutations. */
    const ADD     = 1;
    const MODIFY  = 2;
    const DELETE  = 3;
    const RESTORE = 4;

    /** Id of this revised annotation. */
    protected $revisedAnnotationId;

    /** Id of the annotation this is a revision of. */
    protected $annotationId;
    
    /** Id of the scan this annotation belongs to. */
    protected $scanId;

    /** The polygon of this annotation. */
    protected $polygon;

    /** The annotation information. */ 
    protected $annotationInfo;

    /** The Id of the user who made this revision. */
    protected $changedUserId;

    /** The time and date on which this revision was done. */
    protected $revisionCreateTime;
    
    /** The chronological index of this revision. */
    protected $revisionNumber;
    
    /** The kind of mutation that caused this revision. */
    protected $mutation;
    
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
        return array('polygon', 'annotationInfo','changedUserId', 
                     'revisionCreateTime', 'revisionNumber', 'annotationId', 'scanId', 'mutation'); 
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
                'annotationInfo'      => 'string',
                'changedUserId'       => 'int',
                'revisionCreateTime'  => 'timestamp',
                'revisionNumber'      => 'int',
                'scanId'              => 'int',
                'mutation'            => 'int'
        );
    }
    
    /**
     * Creates and stores a RevisedAnnotation based on the current content of an Annotation.
     * Should be called right after an Annotation has been created (and saved!) or modified.
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
            
            if($lastRev === null || $lastRev->getValue('revisionNumber') === null)
            {
                // This is the first revision of this annotation. 
                // Give it revisionNumber 1.
                $result->setRevisionNumber(1);
                $result->setMutation(RevisedAnnotation::ADD);
            }
            else
            {
                // Set the incremented the revision number.
                $result->setRevisionNumber($lastRev->getValue('revisionNumber') + 1);
                $result->setMutation(RevisedAnnotation::MODIFY);
            }
            
            // Set the revision creation time to the current moment.
            $result->setRevisionCreateTime(time());
            
            // Copy other properties from the Annotation.
            $result->setAnnotationId($aid);
            $result->setScanId($annotation->getScanId());
            $result->setPolygon($annotation->getPolygon());
            $result->setAnnotationInfo($annotation->getAnnotationInfo());
            $result->setChangedUserId($annotation->getChangedUserId());
            
            // Store and return the result.
            $result->save();
            return $result;
        });
    }
    
    /**
     * Add an empty RevisedAnnotation marked as DELETED.
     *
     * @param Annotation $annotation A fully loaded Annotation entity
     *                               that is about to be deleted.
     * 
     * @return The new RevisedAnnotation entity. Is already stored.
     */
    public static function addDeletedRevision($annotation)
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
            
            if($lastRev === null || $lastRev->getValue('revisionNumber') === null)
            {
                // This is the first revision of this annotation. 
                // Give it revisionNumber 1.
                // In fact, this should not happen, but leave it here anyhow.
                $result->setRevisionNumber(1);
            }
            else
            {
                // Set the incremented the revision number.
                $result->setRevisionNumber($lastRev->getValue('revisionNumber') + 1);
            }
            
            $result->setMutation(RevisedAnnotation::DELETE);
            $result->setPolygon(array());
            $result->setTranscriptionEng("");
            $result->setTranscriptionOrig("");
            
            // Set the revision creation time to the current moment.
            $result->setRevisionCreateTime(time());
            
            // Copy other properties from the Annotation.
            $result->setAnnotationId($aid);
            $result->setScanId($annotation->getScanId());
            $result->setChangedUserId($annotation->getChangedUserId());
            
            // Store and return the result.
            $result->save();
            return $result;
        });
    }
    
    /**
     * Takes this revision and restores it as the current one of this annotation. 
     * Make sure this RevisedAnnotation is fully loaded before calling this.
     * 
     * @param $user  The User restoring this revision.
     */
    public function restoreRevision($user)
    {
        // Do not restore a deletion.
        if ($this->getMutation() == RevisedAnnotation::DELETE)
        {
            return; // TODO: throw error?
        }
        
        $_this = $this;
        $userId = $user->getUserId();
        
        // Do a transaction.
        return Database::getInstance()->doTransaction(function() use ($_this, $userId)
        {
            // Query for revision number of the latest other revision of this annotation. 
            $lastRev = Query::select('MAX(revisionNumber) AS revisionNumber')
                                                           ->from('RevisedAnnotations')
                                                           ->where('annotationId = :aid')
                                                           ->execute(array('aid' => $_this->getAnnotationId()),
                                                                     array('aid' => 'int'))
                                                           ->getFirstRow()
                                                           ->getValue("revisionNumber");
            
            // Do not restore the most recent revision.
            if ($_this->getRevisionNumber() == $lastRev)
            {
                // This is not an error (even though it should not happen).
                // Just pretend we did restore the latest version (which we essentially
                // did by just doing nothing).
                return;
            }
            
            try
            {
                // Get the corresponding Annotation.
                $annotation = new Annotation($_this->getAnnotationId());
            }
            catch (EntityException $e)
            {
                // There was no such annotation, it must have been deleted somehow.
                $annotation = new Annotation();
                $annotation->setScanId($_this->getScanId());
                
                // Query for revision number of the latest other revisions of this annotation. 
                $createInfo = Query::select('revisionCreateTime', 'changedUserId')
                                   ->from('RevisedAnnotations')
                                   ->where('annotationId = :aid', 'revisionNumber = :rev')
                                   ->execute(array('aid' => $_this->getAnnotationId(), 'rev' => 1),
                                             array('aid' => 'int', 'rev' => 'int'))
                                   ->getFirstRow();
                $annotation->setTimeCreated(Database::valueFromType($createInfo->getValue('revisionCreateTime'), 'timestamp'));
                $annotation->setCreatedUserId($createInfo->getValue('changedUserId'));
                
                // Query for revision number of the latest other revision of this annotation. 
                $lastOrder = Query::select('MAX(order) AS order')
                                       ->from('Annotations')
                                       ->where('scanId = :sid')
                                       ->execute(array('sid' => $_this->getScanId()),
                                                 array('sid' => 'int'))
                                       ->getFirstRow()
                                       ->getValue("order");
                $annotation->setOrder($lastOrder + 1);
            }
            
            $time = time();
            
            // Write revision fields to that annotation.
            $annotation->setPolygon($_this->getPolygon());
            $annotation->setAnnotationInfo($_this->getAnnotationInfo());
            // The restoring user has last updated this annotation, not the editor of the restored revision!
            $annotation->setChangedUserId($userId);
            $annotation->setTimeChanged($time);
            
            // Store the updated annotation.
            $annotation->save();
            
            // Add a RESTORE RevisedAnnotation.
            $rev = new RevisedAnnotation();
            $rev->setValues($_this->getValues(RevisedAnnotation::getColumns()));
            $rev->setMutation(RevisedAnnotation::RESTORE);
            $rev->setRevisionNumber($lastRev + 1);
            $rev->setRevisionCreateTime($time);
            $rev->setChangedUserId($userId);
            $rev->save();
            
            if ($annotation->getAnnotationId() != $_this->getAnnotationId())
            {
                // A new Annotation has been created, because the Annotation was found to be deleted.
                // We now have to update the relevant revisions to use the new annotationId.
                Query::update('RevisedAnnotations', array('annotationId' => $annotation->getAnnotationId()))
                        ->where('annotationId = :aid')
                        ->execute(array('aid' => $_this->getAnnotationId()));
            }
        });
    }
    
    
    // Getters and setters.
    
    public function getRevisedAnnotationId()    { return $this->revisedAnnotationId; }
    public function setRevisedAnnotationId($id) { $this->revisedAnnotationId = $id;  }

    public function getAnnotationId()    { return $this->annotationId; }
    public function setAnnotationId($id) { $this->annotationId = $id;  }
    
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
    
    public function getRevisionCreateTime()      { return $this->revisionCreateTime; }
    public function setRevisionCreateTime($time) { $this->revisionCreateTime = $time; }
    
    public function getRevisionNumber()     { return $this->revisionNumber; }
    public function setRevisionNumber($num) { $this->revisionNumber = $num;  }
    

    // Returns annotation info as indexed array.
    public function getAnnotationInfo()
    {
        return Annotation::fromCommaList($this->annotationInfo);
    }
    public function setAnnotationInfo($info)
    {
        $this->annotationInfo = Annotation::toCommaList($info);
    }

    public function getMutation()          { return $this->mutation; }
    public function setMutation($mutation) { $this->mutation = $mutation; }
    
    public function getScanId()    { return $this->scanId; }
    public function setScanId($id) { $this->scanId = $id; }
}

