<?php
//[[GPL]]

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
        
        $resultSet = Query::select('token', 'filename', 'size', 'Scans.status AS status')
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
                ($values['status'] == Upload::STATUS_AVAILABLE) ? 'success' : 'error';
            
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
        Log::debug("Uploading a file:\n%s", print_r($file, true));
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
        $upload->setContent($location, true);
        
        $expectedFileSize = $upload->getSize();
        $receivedFileSize = self::getInteger($file, 'size');
        if ($expectedFileSize !== $receivedFileSize)
        {
            throw new UploadException('upload-failed');
        }
        
        // Set values on file.
        $upload->setValues(array(
            'filename'  => self::getString($file, 'name'),
            'size'      => $expectedFileSize,
            'status'    => Upload::STATUS_AVAILABLE,
            'timestamp' => time()
        ));
        
        // Save file.
        $upload->save();
        
        // Upload succeeded.
        return 'success';
    }
}
