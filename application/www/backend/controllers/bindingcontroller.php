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
        
        // Also load the library of each binding.
        foreach ($result['records'] as &$record)
        {
            $library = new Library($record['libraryId']);
            
            $record['library'] = $library->getValues();
        }
        
        return $result;
    }
    
    /**
     * Deletes a binding
     */
    public function actionDelete($data) {
        
        // Collect the binding id from the request.
        $inputBindingId = self::getInteger($data, 'bindingId');
        
        // Assert the user has permission to modify bindings.
        Authentication::assertPermissionTo('change-book-info');
        
        // Load the binding to be modified from the database.
        Database::getInstance()->doTransaction(function() use ($inputBindingId)
        {
            $binding = new Binding($inputBindingId);
            $binding->setStatus(Binding::STATUS_DELETED);
            $binding->save();
        });
    }
}
