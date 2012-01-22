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
        return $this->handleLoad($data, 'Annotation', 'annotationId');
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
                                ($values['order']             === $order))
                            {
                                $annotationIds[] = $annId;
                                continue;
                            }
                            
                            // Remove this if we want user id to be the creator of the
                            // annotation, not the last modifier.
                            $setUserId =
                                ($values['transcriptionEng']  !== $transEng)  ||
                                ($values['transcriptionOrig'] !== $transOrig) ||
                                ($values['polygon']           !== $polygon);
                        }
                    }
                    else
                    {
                        // Create new annotation.
                        $ann = new Annotation();
                        
                        $ann->setTimeCreated(time());
                        
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
                        )
                    );
                    
                    // Set user id.
                    if ($setUserId)
                    {
                        $ann->setUserId($userId);
                    }
                    
                    // Save it.
                    $ann->save();
                    
                    // Add id to list of annotations ids.
                    $annId = $ann->getAnnotationId();
                    $annotationIds[] = $annId;
                    
                    ++$i;
                }
                
                // Remove all annotations that were not just added.
                $whereConds = $whereArgs = $whereTypes = array();
                foreach ($annotationIds as $annId)
                {
                    $whereConds[] = 'annotationId != :param' . $annId;
                    
                    $whereArgs['param' . $annId]  = $annId;
                    $whereTypes['param' . $annId] = 'int';
                }
                
                Query::delete('Annotations')->where($whereConds)->execute($whereArgs, $whereTypes);
                
                return $annotationIds;
            }
        );
    }
}
