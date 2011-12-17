<?php
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a yet unactivated user entity.
 */
class PendingUser extends Entity
{
    /** Pending user id */
    protected $pendingUserId;
    
    /** User id. */
    protected $userId;
    
    /** Confirmation code. */
    protected $confirmationCode;
    
    /**
     * The date of when this pending user will expire. Will be a timestamp.
     */
    protected $expirationDate;
    
    /**
     * Constructs a pending user.
     *
     * @param $id  Id of the pending user. Default (null) will create a new pending user.
     */
    public function __construct($id = null)
    {        
        if ($id !== null)
        {
            $this->pendingUserId = $id;
            
            $this->load();
        }
    }
    
    /**
     * Generates a new unique confirmation code for the specified user.
     */
    private static function generateConfirmationCode($user)
    {
        // This value needs to be unique.
        return md5(uniqid(true));
    }
    
    /**
     * Constructs a new PendingUser based on an existing User. This method will also generate a 
     * confirmation code and set a expiration date. 
     * 
     * This new pending user can subsequently be saved to create a new database entry or update an
     * existing one.
     * 
     * @return PendingUser The new pending user.
     */
    public static function fromUser($user)
    {
        $result = new PendingUser();
        
        // TODO: Make expiration setting.
        
        // Expiration dates are set to one week after the current day.
        $expirationDate = time() + 7 * 24 * 60 * 60;
        
        $values = array(
            'userId'           => $user->getUserId(),
            'confirmationCode' => self::generateConfirmationCode($user),
            'expirationDate'   => $expirationDate,
        );
        
        $result->setValues($values);
        
        return $result;
    }
    
    /**
     * Get the name of the corresponding table.
     */
    protected function getTableName()
    {
        return 'PendingUsers';
    }
    
    /**
     * Get an array with the primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('pendingUserId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    protected function getColumns()
    {
        return array('userId', 'confirmationCode', 'expirationDate');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'pendingUserId'    => 'int',
            'userId'           => 'int',
            'confirmationCode' => 'string',
            'expirationDate'   => 'date',
        );
    }
    
    /*
     * Getters and setters.
     */
    
    public function getPendingUserId() { return $this->pendingUserId; }
    
    public function getUserId()    { return $this->userId; }
    public function setUserId($id) { $this->userId = $id;  }
    
    public function getConfirmationCode()      { return $this->confirmationCode;  }
    public function setConfirmationCode($code) { $this->confirmationCode = $code; }
    
    public function getExpirationDate()      { return $this->expirationDate;  }
    public function setExpirationDate($date) { $this->expirationDate = $date; }
}