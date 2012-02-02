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
        
        // Create scan to test whether scan exists.
        // (Foreign key contraint should also do this.)
        $scan = new Scan($scanId);
        
        // Fetch user id.
        $userId = Authentication::getInstance()->getUserId();
        
        // Fetch annotations.
        $annotations = self::getArray($data, 'annotations');
        
        // Do transation.
        return Database::getInstance()->doTransaction(
            function() use ($scanId, $userId, $annotations)
            {
                // Insert every annotation.
                $i = 0;
                $annotationIds = array();
                $time = time();
                foreach ($annotations as $annotation)
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
                    
                    // Add id to list of annotations ids.
                    $annId = $ann->getAnnotationId();
                    $annotationIds[] = $annId;
                    
                    ++$i;
                }
                
                // Set all ids that need not be removed as parameters.
                $whereConds = $whereArgs = $whereTypes = array();
                foreach ($annotationIds as $annId)
                {
                    $whereConds[] = 'annotationId != :param' . $annId;
                    
                    $whereArgs['param' . $annId]  = $annId;
                    $whereTypes['param' . $annId] = 'int';
                }
                
                // Add scan id.
                $whereConds[] = 'scanId = :scanId';
                
                $whereArgs['scanId']  = $scanId;
                $whereTypes['scanId'] = 'int';
                
                // Remove all annotations that were not just added.
                Query::delete('Annotations')->where($whereConds)->execute($whereArgs, $whereTypes);
                
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
     * Compares two texts for equality, ignoring line ending differences and trailing/leading whitespace.
     */
    public static function textEqual($a, $b)
    {
        $safeA = str_replace("\r\n", "\n", rtrim($a));
        $safeB = str_replace("\r\n", "\n", rtrim($b));
        
        return $safeA === $safeB;
    }
}
