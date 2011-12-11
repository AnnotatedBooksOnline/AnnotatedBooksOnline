<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'model/upload/upload.php';
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
        Authentication::assertLoggedOn();
        
        // Get fields.
        $filename = self::getString($data, 'filename', '', true, 255);
        $size     = self::getInteger($data, 'size', 0, true);
        
        // Create upload from data.
        $upload = Upload::createEmptyUpload(
            Authentication::getInstance()->getUserId(),
            $filename,
            $size
        );
        
        // TODO: Make timestamp work: give entity column types.
        
        return $upload->getToken();
    }
    
    /**
     * Upload a file.
     */
    public function actionUpload($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertLoggedOn();
        
        /*
        
        TODO: Implement the following:
        
        --> Request for token: id, with filename=.., size=.., status=error, token=..
        <-- Upload token
        
        --> File upload
        <-- Error/success
        
        */
        
        // ..
        if (isset($_FILES['file']))
        {
            Log::debug("Uploading a file:\n%s", print_r($_FILES['file'], true));
        }
        
        // Die to prevent AJAX data to be outputted.
        exit;
    }
}
