<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/binding/binding.php';
require_once 'models/library/library.php';

/**
 * Binding controller class.
 */
class BindingController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads binding. 
     */
    public function actionLoad($data)
    {
        // Retrieve the binding id from the request
        $bindingId = self::getInteger($data, 'id', 0);
        $unsafe    = self::getBoolean($data, 'unsafe', 0);
        
        $binding = new Binding($bindingId);
        $library = new Library($binding->getLibraryId());
        
        $scans = Scan::fromBinding($binding);
        $scanStatus = true;

        $binding = $binding->getValues(true, false);
        $binding['library'] = $library->getValues(true, false);
        
        foreach ($scans as $scan)
        {
            if ($scan->getStatus() !== Scan::STATUS_PROCESSED)
            {
                $scanStatus = false;
            }
        }
        
        Log::info($_SERVER['REQUEST_URI']);
        
        if($unsafe || ($binding['status']==2 && $scanStatus))
        {
            return array('records' => $binding, 'total' => 1);
        }
    }
}

