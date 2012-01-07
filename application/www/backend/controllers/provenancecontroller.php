<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/binding/binding.php';
require_once 'models/provenance/provenance.php';
require_once 'models/person/person.php';
require_once 'util/authentication.php';

/**
 * Provenance controller class.
 */
class ProvenanceController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /**
     * Loads provenance. 
     */
    public function actionLoad($data)
    {
        if (isset($data['filters'])
         && isset($data['filters'][0])
         && isset($data['filters'][0]['column'])
         && $data['filters'][0]['column'] == 'bindingId' 
         && isset($data['filters'][0]['value']))
        {
            // Retrieve the binding id from the request
            $bindingId = self::getInteger($data['filters'][0], 'value', 0);
            $binding = new Binding($bindingId);
            
            $provenances = Provenance::fromBinding($binding);
            $provenances = array_map(function($provenance)
            {
                $person = new Person($provenance->getPersonId());
                $provenance = $provenance->getValues(true, false);
                $provenance['name'] = $person->getName();
                return $provenance;
            }, $provenances);
            
            return array('records' => $provenances, 'total' => count($provenances));
        }
    }
}
