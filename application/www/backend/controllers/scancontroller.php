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
        $deleteBookPageNumbers = false;
        
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
                
                $deleteBookPageNumbers = true;
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
            
            $deleteBookPageNumbers = true;
      
            // Deleted any associated uploads.
            if ($scan->getUploadId() !== null) 
            {
                $upload = new Upload($scan->getUploadId());
                $upload->delete();
            }
        }
        
        // Determine if the order of scans has changed. If this is the case clear the starting page
        // and ending page for all books in this binding.
        if ($deleteBookPageNumbers === true)
        {
            foreach ($binding->getBookList() as $book)
            {
                $book->setFirstPage(null);
                $book->setLastPage(null);
                $book->setMarkedAsUpdated(true);
            }
        }
        
        // Update the binding status/
        $binding->setStatus(Binding::STATUS_REORDERED);
        $binding->saveWithDetails();
    }
}

