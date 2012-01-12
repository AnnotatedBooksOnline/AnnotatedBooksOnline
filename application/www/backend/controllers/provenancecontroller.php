<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/provenance/provenancelist.php';
require_once 'models/person/person.php';

/**
 * Provenance controller class.
 */
class ProvenanceController extends ControllerBase
{
    /**
     * Loads provenances.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $result = $this->handleLoad($data, 'Provenance');
        
        // Augment results with person names.
        foreach ($result['records'] as &$record)
        {
            $person = new Person($record['personId']);
            
            $record['name'] = $person->getName();
        }
        
        return $result;
    }
}
