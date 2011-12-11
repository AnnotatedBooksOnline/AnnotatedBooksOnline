<?php

require_once 'framework/database/entity.php';

/**
 * Class representing a yet unactivated user entity.
 */
class PendingUser extends Entity
{
    /** PendingUser id */
    protected $pendingUserId;
    
    /** User id. */
    protected $userId;
    
    /** Confirmation code. */
    protected $confirmationCode;
    
    /** The date of when this pending user will expire. A string in the same format as retrieved 
     *  from the database (or returned by Query::toDate).
     */
    protected $expirationDate;
    
    /**
     * Constructs a pending user.
     * @param $uid If null, an empty pending user will be created. Otherwise one with the provided 
     * 	           userId will be loaded.
     */
    public function __construct($uid = null)
    {        
        if($uid !== null)
        {
            $this->load();
        }
    }
    
    /**
     * Generates a new unique confirmation code for the specified user.
     */
    private static function generateConfirmationCode($user)
    {
        // Since the only real requirements for confirmation codes should be uniqueness (or at least
        // having a one in a gazillion chance of not being unique) and not being directly guessable
        // I'll simply take the MD5-hash of the username, the time and a smiley face.

        return md5($user->getUserName() . time() . ':)');
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
        
        // Expiration dates are set to one week after the current day.
        $expdate = Query::toDate(time() + 604800);
        $values = array(
                    'userId' => $user->getId(),
                    'confirmationCode' => self::generateConfirmationCode($user),
                    'expirationDate' => $expdate);
        
        $result->setValues($values);
        return $result;
    }
    
    
    // Table info.
    
    /**
     * Get the name of the corresponding table.
     */
    protected static function getTableName()
    {
        return 'PendingUsers';
    }
    
    /**
     * Get an array with the primary keys.
     */
    protected static function getPrimaryKeys()
    {
        return array('pendingUserId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    protected static function getColumns()
    {
        return array('userId', 'confirmationCode', 'expirationDate');
    }
    
    // Getters and setters.
    
    public function getId() {return $this->userId;}
    public function setId($id) {$this->userId = id;}
    
    public function getConfirmationCode() {return $this->confirmationCode;}
    public function setConfirmationCode($code) {$this->confirmationCode = $code;}
    
    public function getExpirationDate() {return $this->expirationDate;}
    public function setExpirationDate($date) {$this->expirationDate = $date;}
}