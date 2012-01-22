<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/scan/scanlist.php';
require_once 'models/binding/binding.php';

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
        return $this->handleLoad($data, 'Scan', 'scanId', array(
            'scanId',
            'bindingId',
            'page',
            'status',
            'width',
            'height',
            'zoomLevel',
            //'filename'
        ));
        
        // TODO: Give scan a filename. (Was previously loaded from upload.)
    }
    
    /**
     * 
     * Enter description here ...
     * @param unknown_type $data
     */
    public function actionReorder($data)
    {
        // TODO: Mathijs : Permissions and authentication.
        
        // Collect the binding id and ordered scans from the request.
        $inputBindingId = self::getInteger($data, 'bindingId');
        $inputOrderedScans = self::getArray($data, 'orderedScans');
        
        // Save the new order of the scans.
        $page = 0;
        foreach ($inputOrderedScans as $key => $scanId) 
        {
            Log::info('!!!!!!ScanId ' . $scanId);
            $scan = new Scan($scanId);
            $scan->setPage(++$page);
            $scan->save();
        }
        
        // Update the binding status if this is a new binding and not a binding
        // being modified.
        $binding = new Binding($inputBindingId);
        if ($binding->getStatus() === Binding::STATUS_UPLOADED)
        {
            $binding->setStatus(Binding::STATUS_REORDERED);
            $binding->save();
        }
    }
}
