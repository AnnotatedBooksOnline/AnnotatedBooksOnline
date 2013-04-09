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

require_once 'framework/database/entity.php';

// Exceptions.
class UploadException extends ExceptionBase { }

/**
 * Class representing an upload entity.
 */
class Upload extends Entity
{
    /** Upload status constants. */
    const STATUS_AVAILABLE = 0;
    const STATUS_ERROR     = 1;
    
    /** Fields. */
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
        
        // Create new upload with default settings.
        $upload->userId    = $userId;
        $upload->filename  = $filename;
        $upload->size      = $size;
        $upload->timestamp = time();
        $upload->status    = self::STATUS_ERROR;
        
        $upload->generateNewToken();
        $upload->save();
        
        return $upload;
    }
    
    /**
     * Sets a newly generated token.
     */
    public function generateNewToken()
    {
        $this->token = md5(uniqid(true));
    }
    
    /**
     * Gets an upload by a token.
     *
     * @param $token  Token to lookup upload by.
     *
     * @return  Upload of that token or null.
     *
     * @throws EntityException  If upload could not be found.
     */
    public static function fromToken($token)
    {
        // Fetch upload.
        $resultSet = Query::select('uploadId')
            ->from('Uploads')
            ->where('token = :token')
            ->execute(array('token' => $token));
        
        // Check amount of rows returned.
        if ($resultSet->getAmount() != 1)
        {
            return null;
        }
        
        // Get upload id.
        $uploadId = $resultSet->getFirstRow()->getValue('uploadId', 'int');
        
        // Load upload by id.
        return new Upload($uploadId);
    }
    
    public function delete()
    {
        parent::delete();
        
        // Remove upload file.
        $location = $this->getFileLocation();
        if (file_exists($location))
        {
            unlink($location);
        }
    }
    
    /**
     * Get the contents of the upload.
     *
     * @return  Upload file contents.
     */
    public function getContent()
    {
        return file_get_contents($this->getFileLocation());
    }
    
    /**
     * Set the contents of the upload.
     *
     * @param $filename  Filename with new content.
     * @param $move      Whether to move file. Otherwise a copy is assumed.
     */
    public function setContent($filename, $move = false)
    {
        if ($move)
        {
            $retval = rename($filename, $this->getFileLocation());
        }
        else
        {
            $retval = copy($filename, $this->getFileLocation());
        }
        
        if (!$retval)
        {
            throw new UploadException('upload-set-content-failed');
        }
    }
    
    /**
     * Appends the contents of the given file to the current uploaded data.
     *
     * @param $filename  Filename with new content.
     * @param $unlink    Whether to unlink the newly added file.
     */
    public function appendContent($filename, $unlink = false)
    {
        // Since setting content is simply a move/copy operation it is more
        // memory efficient. This way, when no chunking is used, we do
        // not have to load the entire file in memory again.
        if (!file_exists($this->getFileLocation()))
        {
            $this->setContent($filename, $unlink);
            return;
        }
        
        // Append a chunk to the upload.
        try
        {
            $output = fopen($this->getFileLocation(), 'ab');
            fwrite($output, file_get_contents($filename)) !== false;
            fclose($output);
            if ($unlink)
            {
                unlink($filename);
            }
        }
        catch (Exception $e)
        {
            throw new UploadException('upload-set-content-failed');
        }
    }
    
    /**
     * Gets the current size of the uploaded data so far.
     */
    public function getCurrentSize()
    {
        if (file_exists($this->getFileLocation()))
        {
            return filesize($this->getFileLocation());
        }
        return 0;
    }
    
    /**
     * Get the file location of this upload.
     */
    public function getFileLocation()
    {
        return '../data/uploads/' . $this->token . '.upload';
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
        return array('userId', 'token', 'filename', 'size', 'timestamp', 'status');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'uploadId'  => 'int',
            'userId'    => 'int',
            'token'     => 'istring',
            'filename'  => 'istring',
            'size'      => 'int',
            'timestamp' => 'timestamp',
            'status'    => 'int',
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getUploadId() { return $this->uploadId; }
    
    public function getUserId()    { return $this->userId; }
    public function setUserId($id) { $this->userId = $id;  }
    
    public function getToken() { return $this->token; }
    
    public function getFilename()          { return $this->filename;      }
    public function setFilename($filename) { $this->filename = $filename; }
    
    public function getSize()      { return $this->size;  }
    public function setSize($size) { $this->size = $size; }
    
    public function getTimestamp()           { return $this->timestamp;       }
    public function setTimestamp($timestamp) { $this->timestamp = $timestamp; }
    
    public function getStatus()        { return $this->status;    }
    public function setStatus($status) { $this->status = $status; }
}
