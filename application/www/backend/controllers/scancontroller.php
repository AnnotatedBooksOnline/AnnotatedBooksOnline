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
     * Reorders the scans of a binding
     */
    public function actionReorder($data)
    {     
        
        // Assert the user has permission to upload bindings.
        Authentication::assertPermissionTo('upload-bindings');
        
        // Collect the binding id and ordered scans from the request.
        $inputBindingId    = self::getInteger($data, 'bindingId');
        $inputOrderedScans = self::getArray($data, 'orderedScans');
        $inputDeletedScans = self::getArray($data, 'deletedScans');
        
        // Load the binding to be modified from the database.
        $binding = new Binding($inputBindingId);
       
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
            // Mark the scan as deleted.
            $scan = new Scan($scanId);
            $scan->setStatus(Scan::STATUS_DELETED);
            $scan->setUploadId(null);
            $scan->save();
            
            // Deleted any associated uploads.
            if ($scan->getUploadId() !== null) 
            {
                $upload = new Upload($scan->getUploadId());
                $upload->delete();
            }
        }
        
        // Update the binding status/
        $binding->setStatus(Binding::STATUS_REORDERED);
        $binding->save();
    }
}

