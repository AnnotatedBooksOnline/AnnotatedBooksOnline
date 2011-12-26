<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/scan/scan.php';
require_once 'models/binding/binding.php';

/**
 * Scan controller class.
 */
class ScanController extends Controller
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
         && $data['filters'][0]['column'] == 'bindingId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the binding id from the request
            $bindingId = self::getInteger($data['filters'][0], 'value', 0);
            $binding = new Binding($bindingId);
            
            $scans = Scan::fromBinding($binding);
            $scans = array_map(function($scan)
            {
                return $scan->getValues(true, false);
            }, $scans);
            
            return array('records' => $scans, 'total' => count($scans));
        }
    }
}

