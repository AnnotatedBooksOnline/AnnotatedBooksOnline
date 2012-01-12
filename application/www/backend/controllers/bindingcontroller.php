<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/library/library.php';

/**
 * Binding controller class.
 */
class BindingController extends ControllerBase
{
    /**
     * Loads bindings.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $result = $this->handleLoad($data, 'Binding', 'bindingId');
        
        // Also load each library of the each binding.
        foreach ($result['records'] as &$record)
        {
            $library = new Library($record['libraryId']);
            
            $record['library'] = $library->getValues();
        }
        
        return $result;
    }
}
