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

require_once 'framework/controller/controller.php';
require_once 'models/upload/upload.php';
require_once 'util/authentication.php';

/**
 * Upload controller class.
 */
class UploadController extends Controller
{
    /**
     * Fetches an upload token.
     */
    public function actionFetchToken($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('upload-bindings');
        
        // Get fields.
        $filename = self::getString($data, 'filename', '', true, 255);
        $size     = self::getInteger($data, 'size', 0, true);
        
        // Create upload from data.
        $upload = Upload::createEmptyUpload(
            Authentication::getInstance()->getUserId(),
            $filename,
            $size
        );
        
        return $upload->getToken();
    }
    
    /**
     * Fetches an upload token.
     */
    public function actionFetchUploads($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('upload-bindings');
        
        $userId = Authentication::getInstance()->getUserId();
        
        $resultSet = Query::select('token', 'filename', 'size', 'Uploads.status AS status')
            ->from('Uploads')
            ->join('Scans', "Scans.uploadId = Uploads.uploadId", "LEFT")
            ->where('userId = :userId', "Scans.scanId is null")
            ->orderBy('filename')
            ->execute(array('userId' => $userId), array('userId' => 'int'));
        
        $result = array();
        foreach ($resultSet as $row)
        {
            $values = $row->getValues();
            
            $values['status'] = 
                ($values['status'] != Upload::STATUS_ERROR) ? 'success' : 'error';
            
            $result[] = $values;
        }
        
        return $result;
    }
    
    /**
     * Removed an upload
     */
    public function actionDelete($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('upload-bindings');
        
        // Get token.
        $token = self::getString($data, 'token');
        
        // Fetch upload by token.
        $upload = Upload::fromToken($token);
        if ($upload === null)
        {
            throw new UploadException('upload-token-not-found');
        }
        
        // Delete upload.
        $upload->delete();
    }
    
    /**
     * Upload a file.
     */
    public function actionUpload($data)
    {        
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('upload-bindings');
        
        // Get token.
        $token = self::getString($_POST, 'token');
        
        // Fetch upload by token.
        $upload = Upload::fromToken($token);
        if ($upload === null)
        {
            throw new UploadException('upload-token-not-found');
        }
        
        // Get file.
        $file = self::getArray($_FILES, 'file');
        if (!isset($_FILES['file']))
        {
            throw new UploadException('upload-no-file');
        }
        
        // Show some debug info.
        Log::debug("Uploading a file chunk:\n%s", print_r($file, true));
        Log::debug("Uploading an upload:\n%s", print_r($upload->getValues(), true));
        
        // Check error.
        $error = self::getInteger($file, 'error', -1);
        if ($error !== UPLOAD_ERR_OK)
        {
            throw new UploadException('upload-failed');
        }
        
        // Check user id.
        $userId = Authentication::getInstance()->getUserId();
        if ($upload->getUserId() !== $userId)
        {
            throw new UploadException('upload-not-of-user');
        }
        
        // Set file as content.
        $location = self::getString($file, 'tmp_name');
        $upload->appendContent($location, true);
        
        // Check if there are still any missing chunks.
        if ($upload->getCurrentSize() < $upload->getSize())
        {
            return "chunk-received-" . $upload->getCurrentSize();
        }
        
        // Check if we did receive the correct amount of data.
        if ($upload->getCurrentSize() !== $upload->getSize())
        {
            throw new UploadException('upload-wrong-filesize');
        }
        
        $this->convertUpload($upload->getFileLocation());
        
        // Set values on file.
        $upload->setValues(array(
            'filename'  => self::getString($file, 'name'),
            'size'      => $upload->getSize(),
            'status'    => Upload::STATUS_AVAILABLE,
            'timestamp' => time()
        ));
        
        // Save file.
        $upload->save();
        
        // Upload succeeded.
        return 'success';
    }
    
    /*
     *  Convert a TIFF image upload to JPG.
     */
    private function convertUpload($location)
    {
        try
        {
            $uploadIdent = getimagesize($location);
            if (!$uploadIdent)
            {
                // Not an image.
                Log::debug("Not an image, not converting.");
                return;
            }
            
            // Determine image type.
            if ($uploadIdent[2] == IMAGETYPE_JPEG) 
            {
                // JPEG is fine, continue.
                Log::debug("JPEG image, not converting.");
                return;
            } 
            else if ($uploadIdent[2] == IMAGETYPE_TIFF_II || $uploadIdent[2] == IMAGETYPE_TIFF_MM) 
            {
                Log::debug('Converting upload: %s', $location);
            }
            else
            {
                // Unknown image: will fail later.
                Log::debug("Unknown image type, not converting.");
                return;
            }
            
            $tmp = tempnam(sys_get_temp_dir(), 'convertUpload');
            $command = escapeshellarg(getcwd() . "/../../../tilepyramidbuilder/bin/tiff2jpeg") . ' ' . escapeshellarg($location) . ' ' . escapeshellarg($tmp) . " 2>&1";
            
            // Execute converter.
            Log::debug('Executing: %s', $command);
            exec($command, $output, $rval);
            
            // Check return value to see whether operation succeeded.
            if ($rval != 0)
            {
                // Something went wrong - don't convert now.
                Log::error('Conversion of %s failed: %s', $location, print_r($output, true));
                return;
            }
            
            rename($tmp, $location);
            
            Log::debug('Done converting to JPG.');
        }
        catch(Exception $e)
        {
            Log::error("Error while converting to JPG: %s", $e->getMessage());
        }
    }
}

