<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing an upload entity.
 */
class Upload extends Entity
{
    /** Upload status constants. */
    const STATUS_AVAILABLE = 0;
    const STATUS_ERROR     = 1;
    
    protected $uploadId;
    protected $userId;
    protected $token;
    protected $filename;
    protected $size;
    protected $timestamp;
    protected $status;
    
    /**
     * Constructs an upload entity.
     *
     * @param $id  Id of the upload. Default (null) will create a new upload.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->uploadId = $id;
            
            $this->load();
        }
    }
    
    /**
     * Creates a new empty upload with default settings.
     *
     * @param $userId
     * @param $filename
     * @param $size
     * 
     * @return  The entity of the newly created upload, with its primary key set.
     */
    public static function createEmptyUpload($userId, $filename, $size)
    {
        $upload = new Upload();
        
        // Obtain timestamp.
        $timestamp = time();
        
        // Create new upload with default settings.
        $upload->userId    = $userId;
        $upload->token     = md5(uniqid(true));
        $upload->filename  = $filename;
        $upload->size      = $size;
        $upload->timestamp = $timestamp;
        $upload->status    = Upload::STATUS_ERROR;
        $upload->save();
        
        return $upload;
    }
    
    /**
     * Sets a newly generated token.
     */
    public function setNewToken()
    {
        $this->token = md5(uniqid(true));
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'Uploads';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('uploadId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('uploadId', 'userId', 'token', 'filename', 'size', 'timestamp', 'status');
    }
    
    // Getters and setters.
    public function getId()    { return $uploadId;      }
    public function setId($id) { $this->uploadId = $id; }
    
    public function getToken() { return $token; }
    
    // TODO: Add all getters/setters.
    
    public function getStatus()        { return $status;          }
    public function setStatus($status) { $this->status = $status; }
}
