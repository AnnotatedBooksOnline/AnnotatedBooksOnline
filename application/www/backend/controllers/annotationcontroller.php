<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/annotation/annotation.php';
require_once 'models/scan/scan.php';

/**
 * Annotation controller class.
 */
class AnnotationController extends Controller
{
    /**
     * Loads annotation(s).
     */
    public function actionLoad($data)
    {
        // TODO: Really, can we create a generic method that handles any load command in
        // TODO: EntitityList or something? (Gerben)
        
        // I don't think so, or the EntityList has to understand all relations between the Entities.
        // Some aspects of it could be more generalized, though. (Bert)
        
        if (isset($data['filters'])
         && isset($data['filters'][0])
         && isset($data['filters'][0]['column'])
         && $data['filters'][0]['column'] == 'scanId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the binding id from the request
            $scanId = self::getInteger($data['filters'][0], 'value', 0);
            $scan = new Scan($scanId);
            
            $annotations = Annotation::fromScan($scan);
            $annotations = array_map(function($annotation)
            {
                $a = $annotation->getValues(true, false);
                $a['polygon'] = $annotation->getPolygon();
                return $a;
            }, $annotations);
            
            return array('records' => $annotations, 'total' => count($annotations));
        }
    }
}

