<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/binding/binding.php';
require_once 'models/library/library.php';

// Exceptions.
class BindingNotFoundException extends ExceptionBase
{
    public function __construct($bindingId)
    {
        parent::__construct('binding-not-found', $bindingId);
    }
}

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
     * Loads binding. Doesn't work properly: I added this and changed plans afterwards.
     * Starting over makes sens, I (Renze) don't mind.
     */
    public function actionLoad($data)
    {
        // Retrieve the binding id from the request
        $bindingId = self::getInteger($data, 'bindingId', 0);
        
        $binding = new Binding($bindingId);
        $library = new Library($binding->getLibraryId());
        $libraryName = $library->getLibraryName();
        $signature = $binding->getSignature();
        $title = $libraryName . ', ' . $signature;
        
        return array('records' => array(
            'bindingId' => $bindingId,
            'title'     => $title,
            'library'   => $libraryName,
            'signature' => $signature
        ), 'total' => 1);
    }
}
