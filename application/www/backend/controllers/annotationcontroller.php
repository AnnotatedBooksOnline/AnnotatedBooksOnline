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
        Log::debug('Fetching annotations: %s', print_r($data, true));
        
        // TODO: Really, can we create a generic method that handles any load command in
        // TODO: EntitityList or something?
        
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
                return $annotation->getValues(true, false);
            }, $annotations);
            
            return array('records' => $annotations, 'total' => count($annotations));
        }
    }
}
