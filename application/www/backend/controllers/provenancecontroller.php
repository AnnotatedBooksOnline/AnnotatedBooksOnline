<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

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
