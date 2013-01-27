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
require_once 'models/scan/scan.php';

class CommentUpdateException extends ExceptionBase {}

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
        $result = $this->handleLoad($data, 'Scan', 'scanId', array(
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
        foreach ($result['records'] as $id => $scan)
        {
            $result['records'][$id]['location'] = Scan::getLocation($scan['scanId']);
        }
        return $result;
    }
    
    /**
     * Reorders the scans of a binding
     */
    public function actionReorder($data)
    {     
        // Assert the user has permission to upload bindings.
        Authentication::assertPermissionTo('upload-bindings');
        
        Database::getInstance()->doTransaction(function() use ($data)
        {
            // Collect the binding id and ordered scans from the request.
            $inputBindingId    = Controller::getInteger($data, 'bindingId');
            $inputOrderedScans = Controller::getArray($data, 'orderedScans');
            $inputDeletedScans = Controller::getArray($data, 'deletedScans');
            
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
        });
    }
        
    /**
     * Fetch the scan comments of a certain page.
     * 
     * @param array $data Should contain a scanId.
     * 
     * @return The scan comments.
     */
    public function actionGetScanComments($data)
    {
        // No authentication step, since this information is public.
        
        // Get scanId.
        $scanId = $data['scanId'];
        
        // Fetch current comments.
        $resultRow = Query::select('comments')
                            ->from('ScanComments')
                            ->aggregate('MAX', 'maxNum', 'versionNumber')
                            ->where('scanId = :scanId')
                            ->where('versionNumber = maxNum')
                            ->execute(array('scanId' => $scanId),
                                    array('scanId' => 'int'))
                                    ->tryGetFirstRow();
        
        if($resultRow === null)
        {
            // No comments yet. Return an empty string.
            return '';
        }
        else
        {
            return $resultRow->getValue('comments');
        }
    }
    
    /**
     * Updates the comments related to a single scan. 
     * 
     * A user uploads both his or her edited version of the comments (let's call that n) and what 
     * the comments looked like to that user before editing (p). If p is equal to the comments as 
     * currently present in the database, then that is overwritten with n. Otherwise, a conflict 
     * between two simultanious edits has occured and the user gets a chance to merge the two edits.
     * 
     * Since conflicts can be assumed to be quite rare, no automatic merging is done; instead, the 
     * user submitting a conflict will get a message telling them their addition has failed and are
     * requested to do it again.
     * 
     * Comments can not be longer than 5000 bytes (UTF-8).
     * 
     * $data array should contain scanId, userId, previousComments and newComments.
     * 
     * @return string null on success, or the conflicting comments in case someone else was editing
     *                     at the same time. 
     * 
     */
    public function actionUpdateScanComments($data)
    {
        Authentication::assertPermissionTo('edit-scan-comments');
        
        // Fetch data.
        $scanId = $data['scanId'];
        $userId = $data['userId'];
        $prev = $data['prevComments'];
        $new = $data['newComments'];
        
        // Assert new comments aren't too long.
        if(strlen($new) > 5000)
        {
            throw new CommentUpdateException('comments-too-long');
        }
        
        // Handle update in transaction.
        return Database::getInstance()->doTransaction(function() use ($scanId, $userId, $prev, $new)
        {
            // Fetch current comments.
            $resultRow = Query::select('userId', 'comments', 'versionNumber')
                               ->from('ScanComments')
                               ->aggregate('MAX', 'maxNum', 'versionNumber')
                               ->where('scanId = :scanId')
                               ->where('versionNumber = maxNum')
                               ->execute(array('scanId' => $scanId),
                                         array('scanId' => 'int'))
                               ->tryGetFirstRow();
            
            if($resultRow === null)
            {
                // No comments yet. Let these be the first.
                Query::insert('ScanComments', array(
                                        'userId'        => $userId,
                                        'scanId'        => $scanId, 
                                        'comments'      => $new, 
                                        'versionNumber' => 1));
                
                return null;
            }
            else
            {
                $current = $resultRow->getValue('comments');
                $version = $resultRow->getValue('versionNumber');
                
                // Compare current comments to previous ones of this user.
                if($current == $prev)
                {
                    // They are identical, meaning the new one can be inserted with no problem.
                    Query::insert('ScanComments', array(
                            'userId'        => $userId,
                            'scanId'        => $scanId,
                            'comments'      => $new,
                            'versionNumber' => $version + 1));
                    
                    return null;
                }
                else
                {
                    // A conflict occured. Return the current comments and let the user try again.
                    return $current;
                }
            }
        });
    }
}

