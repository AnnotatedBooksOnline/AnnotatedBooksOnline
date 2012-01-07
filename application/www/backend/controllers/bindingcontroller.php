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
        
        $binding = new Binding($bindingId);
        $library = new Library($binding->getLibraryId());

        $binding = $binding->getValues(true, false);
        $binding['library'] = $library->getValues(true, false);
        
        if($binding['status']==2)
        {
            return array('records' => $binding, 'total' => 1);
        }
        
    }
}

