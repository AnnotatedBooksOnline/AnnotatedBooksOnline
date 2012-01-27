<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/library/library.php';
require_once 'util/authentication.php';

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
    
    /**
     * 
     */
    public function actionDelete($data) {
        
        // Collect the binding id from the request.
        $inputBindingId = self::getInteger($data, 'bindingId');
        
        // Assert the user has permission to modify bindings.
        Authentication::assertPermissionTo('change-book-info');
        
        // Load the binding to be modified from the database.
        $binding = new Binding($inputBindingId);
        $binding->setStatus(Binding::STATUS_DELETED);
        $binding->save();
        
    }
}
