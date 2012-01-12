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
            'width',
            'height',
            'zoomLevel',
            //'filename'
        ));
        
        // TODO: Give scan a filename. (Was previously loaded from upload.)
    }
    
    public function actionReorder($data)
    {
        // TODO: Data may not actually be an array. Encapsulate and use self::getArray(..).
        // TODO: Check for case that there are not scans: $scan->getBindingId() will fail.
        
        $page = 0;
        foreach ($data as $key => $value) 
        {
            $scan = new Scan($value);
            $scan->setPage(++$page);
            $scan->save();
        }
        
        $binding = new Binding($scan->getBindingId());
        $binding->setStatus(Binding::STATUS_REORDERED);
        $binding->save();
    }
}
