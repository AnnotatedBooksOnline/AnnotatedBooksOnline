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

require_once 'controllers/controllerbase.php';
require_once 'util/authentication.php';
require_once 'models/annotation/annotationlist.php';
require_once 'models/annotation/revisedannotationlist.php';
require_once 'controllers/bookcontroller.php';

/**
 * Annotation controller class.
 */
class AnnotationController extends ControllerBase
{
    /**
     * Loads annotations.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $result = $this->handleLoad($data, 'Annotation', 'annotationId');
        
        // Also load the name of the users who created and last modified the annotation.
        foreach ($result['records'] as &$record)
        {
            $createdUser = new User($record['createdUserId']);
            $changedUser = new User($record['changedUserId']);
            
            $record['createdName'] = $createdUser->getFirstName() . ' ' . $createdUser->getLastName();
            $record['changedName'] = $changedUser->getFirstName() . ' ' . $changedUser->getLastName();
        }
        
        return $result;
    }
    
    /**
     * Saves annotations.
     */
    public function actionSave($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('add-annotations');
        
        // Fetch scan id.
        $scanId = self::getInteger($data, 'scanId');
        
        // Fetch user id.
        $userId = Authentication::getInstance()->getUserId();
        
        // Fetch annotations.
        $updated = self::getArray($data, 'updated');
        $removed = self::getArray($data, 'removed');
        
        // Do transaction.
        return Database::getInstance()->doTransaction(
            function() use ($scanId, $userId, $updated, $removed)
            {
                // Create scan to test whether scan exists.
                // (Foreign key contraint should also do this.)
                $scan = new Scan($scanId);
                
                // Insert every annotation.
                $i = 0;
                $annotationIds = array();
                $time = time();
                foreach ($updated as $annotation)
                {
                    // Fetch values.
                    $annId     = Controller::getInteger($annotation, 'annotationId');
                    $transEng  = Controller::getString($annotation, 'transcriptionEng');
                    $transOrig = Controller::getString($annotation, 'transcriptionOrig');
                    $polygon   = Controller::getArray($annotation, 'polygon');
                    
                    // Check polygon.
                    foreach ($polygon as &$vertex)
                    {
                        $vertex = array(
                            'x' => Controller::getDouble($vertex, 'x'),
                            'y' => Controller::getDouble($vertex, 'y')
                        );
                    }
                    
                    // Fetch or create annotation.
                    $setChanged = false;
                    if ($annId > 0)
                    {
                        // Load existing annotation.
                        $ann = new Annotation($annId);
                        
                        // Check for changes.
                        if (!$setChanged)
                        {
                            $values = $ann->getValues(
                                array('transcriptionEng', 'transcriptionOrig', 'polygon', 'order'));
                            
                            if (($values['order'] === $i)                                                   &&
                                (AnnotationController::textEqual($values['transcriptionEng'], $transEng))   &&
                                (AnnotationController::textEqual($values['transcriptionOrig'], $transOrig)) &&
                                (AnnotationController::polygonEqual($values['polygon'], $polygon)))
                            {
                                $annotationIds[] = $annId;
                                ++$i;
                                
                                continue;
                            }
                            
                            // Check whether the transcription or the polygon itself changed
                            $setChanged =
                                (!AnnotationController::textEqual($values['transcriptionEng'], $transEng))   ||
                                (!AnnotationController::textEqual($values['transcriptionOrig'], $transOrig)) ||
                                (!AnnotationController::polygonEqual($values['polygon'], $polygon));
                        }
                    }
                    else
                    {
                        // Create new annotation.
                        $ann = new Annotation();
                        $ann->setTimeCreated($time);
                        $ann->setCreatedUserId($userId);
                        
                        $setChanged = true;
                    }
                    
                                        
                    // Set its values.
                    $ann->setValues(
                        array(
                            'transcriptionEng'  => $transEng,
                            'transcriptionOrig' => $transOrig,
                            'polygon'           => $polygon,
                            'order'             => $i,
                            'scanId'            => $scanId
                        )
                    );
                    
                    // Set user id.
                    if ($setChanged)
                    {
                        $ann->setChangedUserId($userId);
                        $ann->setTimeChanged($time);
                    }
                    
                    // Save it.
                    $ann->save();
                    
                    if ($setChanged)
                    {
                        // Add RevisedAnnotation to keep track of this revision.
                        RevisedAnnotation::addRevised($ann);
                    }
                    
                    // Add id to list of annotations ids.
                    $annId = $ann->getAnnotationId();
                    $annotationIds[] = $annId;
                    
                    ++$i;
                }
                                
                // Remove all Annotations that were marked removed.
                $removed = array_map(function($a)
                {
                    return $a['annotationId'];
                }, $removed);
                $scanAnnotations = AnnotationList::findForUpdate(array('scanId' => $scanId))->getEntities();
                foreach ($scanAnnotations as $ann)
                {
                    if (in_array($ann->getAnnotationId(), $removed))
                    {
                        $ann->setChangedUserId($userId);
                        $ann->setTimeChanged($time);
                        
                        RevisedAnnotation::addDeletedRevision($ann);
                        $ann->delete();
                    }
                }
                                
                return $annotationIds;
            }
        );
    }
    
    /**
     * Compares two polygons for equality with delta.
     */
    public static function polygonEqual($a, $b)
    {
        // Checks for equality of two vertices.
        $vertexEqual = function($a, $b)
        {
            $delta = 1e-6;
            
            return ($a !== null) && ($b !== null) && (abs($a['x'] - $b['x']) < $delta) && (abs($a['y'] - $b['y']) < $delta);
        };
        
        // Zip the two polygons together.
        $zip = array_map(null, $a, $b);
        
        // Check for equality of all vertices.
        foreach ($zip as $vertex)
        {
            if (!$vertexEqual($vertex[0], $vertex[1]))
            {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Get the annotion revisions for each annotation on a scan. 
     * 
     * @param $data['scanId'] The id of the scan.
     * 
     * @return An array of associative arrays containing revisions, grouped by Annotation.
     */
    public function actionGetScanRevisions($data)
    {
        // Check permission to view this.
        Authentication::assertPermissionTo('view-history');
        
        // Fetch the scan id.
        $scanId = self::getInteger($data, 'scanId');
        
        // Do a transaction.
        return Database::getInstance()->doTransaction(function() use ($scanId)
        {            
            // Query the RevisedAnnotations belonging to this scan.
            $orderArr = array('annotationId' => 'ASC', 'revisionNumber' => 'DESC');
            $list = RevisedAnnotationList::find(array('scanId' => $scanId),
                                                0,
                                                null,
                                                $orderArr)->getEntities();
            
            // Obtain the revisions of Annotations of this scan, including
            // those previously deleted, and group them by Annotation.
            $result = array();
            $count = -1;
            $last = null;
            foreach($list as $ann)
            {
                if ($ann->getAnnotationId() !== null)
                {
                    if ($ann->getAnnotationId() !== $last)
                    {
                        $result[] = array();
                        $count++;
                        $last = $ann->getAnnotationId();
                    }
                    $result[$count][] = $ann->getValues();
                }
            }
            
            return $result;
        });
    }
    
    /**
     * Restore a previous revision of an annotation.
     * 
     * NOTE: the current version of the annotation, along with more recent revisions, are deleted. 
     * 
     * @param $data Should contain a revisedAnnotationId referring to the revision to restore.
     */
    public function actionRestoreRevision($data)
    {
        // Check permission.
        Authentication::assertPermissionTo('revert-changes');
        
        // Fetch the revision id.
        $revisionId = self::getInteger($data, 'revisedAnnotationId');
        
        // Start a transaction.
        Database::getInstance()->doTransaction(function() use($revisionId)
        {
            // Fetch the RevisedAnnotation.
            $revision = new RevisedAnnotation($revisionId);
            
            // Restore it.
            $revision->restoreRevision(Authentication::getInstance()->getUser());
        });
    }
    
    /**
     * Searches annotations matching a boolean AND of the query terms.
     *
     * @param $data Should contain a 'query' separated by spaces, and 'bindingId'
     *              specifying the binding to search in.
     */
    public function actionSearch($data)
    {
        $terms = Controller::getString($data, 'query');
        
        $query = Query::select('annotations.annotationId', 'text.text', 'annotations.scanId', 'scans.page')
                      ->from('Annotations annotations')
                      ->join('Scans scans', array('annotations.scanId = scans.scanId'), 'LEFT')
                      ->join('AnnotationsFT text', array('annotations.annotationId = text.annotationId'), 'LEFT')
                      ->where('scans.bindingId = :binding');
        $binds = array('binding' => Controller::getInteger($data, 'bindingId'));
        $i = 0;

        BookController::addFullText('fulltext', 'text.text', $terms, null, true, $query, $binds, $i);
        $results = $query->execute($binds);

        $limit = -1; // Don't limit for now.
        $anns = array();        
        foreach($results as $result)
        {
            if ($limit == 0)
            {
                break;
            }
            
            $text = $result->getValue('text');
            $anns[] = array(
                'annotationId' => (int) $result->getValue('annotationId'),
                'scanId'       => (int) $result->getValue('scanId'),
                'page'         => (int) $result->getValue('page'),
                'headline'     => BookController::headline($text, $terms, 20)
            );
            
            $limit--;
        }
        
        return $anns;
    }
    
    /**
     * Compares two texts for equality, ignoring line ending differences and trailing/leading whitespace.
     */
    public static function textEqual($a, $b)
    {
        $safeA = str_replace("\r\n", "\n", rtrim($a));
        $safeB = str_replace("\r\n", "\n", rtrim($b));
        
        return $safeA === $safeB;
    }
}
