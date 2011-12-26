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
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads scan. 
     */
    public function actionLoad($data)
    {
        if (isset($data['filters'])
         && isset($data['filters'][0])
         && isset($data['filters'][0]['column'])
         && $data['filters'][0]['column'] == 'scanId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the binding id from the request
            $scanId = self::getInteger($data['filters'][0], 'value', 0);
            $scan = new Scan($scanId);
            
            $annots = Annotation::fromScan($scan);
            $annots = array_map(function($annot)
            {
                return $annot->getValues(true, false);
            }, $annots);
            
            return array('records' => $annots, 'total' => count($annots));
        }
    }
}

