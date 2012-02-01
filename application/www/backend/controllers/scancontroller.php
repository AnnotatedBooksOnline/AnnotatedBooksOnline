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
        $binding->loadDetails();
        
        $page = 0;
        $orderChanged = false;
        
        // Iterate over all scans in the provided new order.
        foreach ($inputOrderedScans as $key => $scanId)
        {
            $page++;
            $scan = $binding->getScanList()->getByKeyValue('scanId', $scanId);
            
            // Determine if the page number changed for this scan. If this is the case update
            // the scan in the database.
            if ($scan != null && $page != $scan->getPage()) 
            {
                $scan->setPage($page);
                $scan->setMarkedAsUpdated(true);
                
                $orderChanged = true;
            }
        }
        
        // Determine if the order of scans has changed. If this is the case clear the starting page
        // and ending page for all books in this binding.
        if ($inputOrderedScans === true) 
        {
            foreach ($binding->getBookList() as $book)
            {
                $book->setFirstPage(null);
                $book->setLastPage(null);
                $book->setMarkedAsUpdated(true);
            }
        }
                
        // Iterate over all scans to be deleted.
        foreach ($inputDeletedScans as $key => $scanId)
        {
            // Get the scan from the binding and mark it as deleted.
            $scan = $binding->getScanList()->getByKeyValue('scanId', $scanId);
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
        $binding->saveWithDetails();
    }
}

