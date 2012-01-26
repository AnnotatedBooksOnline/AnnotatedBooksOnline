<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/scan/scanlist.php';
require_once 'models/upload/upload.php';
require_once 'models/binding/binding.php';
require_once 'util/authentication.php';

/**
 * Scan controller class.
 */
class ScanController extends ControllerBase
{
    /**
     * Loads scans.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $defaultSorters = array(
            array('column' => 'page', 'direction' => 'ASC')
        );
        return $this->handleLoad($data, 'Scan', 'scanId', array(
            'scanId',
            'bindingId',
            'page',
            'status',
            'width',
            'height',
            'zoomLevel',
            'scanName',
            'bookTitle'
        ), $defaultSorters);
        
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     */
    public function actionReorder($data)
    {     
        // Collect the binding id and ordered scans from the request.
        $inputBindingId = self::getInteger($data, 'bindingId');
        $inputOrderedScans = self::getArray($data, 'orderedScans');
        $inputDeletedScans = self::getArray($data, 'deletedScans');
        
        // Load the binding to be modified from the database.
        $binding = new Binding($inputBindingId);
        
        // Determine if this is a binding that is being modified. This is the case if the binding
        // status is not 'uploaded' or 'reordered'
        if ($binding->getStatus() != Binding::STATUS_UPLOADED) {
            
            // Assert the user has permission to modify bindings.
            Authentication::assertPermissionTo('change-book-info');
        }
        
        // TODO : MathijsB make this safer.
        
        // Save the new order of the scans.
        $page = 0;
        foreach ($inputOrderedScans as $key => $scanId) 
        {
            Log::info('!!!!!!ScanId ' . $scanId);
            $scan = new Scan($scanId);
            $scan->setPage(++$page);
            $scan->save();
        }
        
        // Deleted the deleted scans.
        foreach ($inputDeletedScans as $key => $scanId)
        {
            $scan = new Scan($scanId);
            $scan->delete();
            
            // Deleted any associated uploads.
            if ($scan->getUploadId() !== null) 
            {
                $upload = new Upload($scan->getUploadId());
                $upload->delete();
            }
        }
        
        // Update the binding status if this is a new binding and not a binding
        // being modified.
        if ($binding->getStatus() === Binding::STATUS_UPLOADED)
        {
            $binding->setStatus(Binding::STATUS_REORDERED);
            $binding->save();
        }
    }
}

