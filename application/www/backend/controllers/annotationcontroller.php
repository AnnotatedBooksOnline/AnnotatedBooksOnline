<?php
//[[GPL]]

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
                
        // Also load the name of each language.
        foreach ($result['records'] as &$record)
        {
            $createdUser = new User($record['createdUserId']);
            $changedUser = new User($record['changedUserId']);
            $record['createdName'] = $createdUser->getFirstName()." ".$createdUser->getLastName();
            $record['changedName'] = $changedUser->getFirstName()." ".$changedUser->getLastName();
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
                    $setUserId = false;
                    $time = time();
                    if ($annId > 0)
                    {
                        // Load existing annotation.
                        $ann = new Annotation($annId);
                        
                        // Check for changes.
                        if (!$setUserId)
                        {
                            $values = $ann->getValues(
                                array('transcriptionEng', 'transcriptionOrig', 'polygon', 'order'));
                            
                            if (($values['transcriptionEng']  === $transEng)  &&
                                ($values['transcriptionOrig'] === $transOrig) &&
                                ($values['polygon']           === $polygon)   &&
                                ($values['order']             === $i))
                            {
                                $annotationIds[] = $annId;
                                continue;
                            }
                        }
                    }
                    else
                    {
                        // Create new annotation.
                        $ann = new Annotation();
                        
                        $ann->setTimeCreated($time);
                        
                        $setUserId = true;
                    }
                    
                    // Set its values.
                    $ann->setValues(
                        array(
                            'transcriptionEng'  => $transEng,
                            'transcriptionOrig' => $transOrig,
                            'polygon'           => $polygon,
                            'order'             => $i,
                            'scanId'            => $scanId,
                            'changedUserId'     => $userId,
                            'timeChanged'       => $time
                        )
                    );
                    
                    // Set user id.
                    if ($setUserId)
                    {
                        $ann->setCreatedUserId($userId);
                    }
                    
                    // Save it.
                    $ann->save();
                    
                    // Add id to list of annotations ids.
                    $annId = $ann->getAnnotationId();
                    $annotationIds[] = $annId;
                    
                    ++$i;
                }
                
                // Set all ids that need not removed as parameters.
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
}
