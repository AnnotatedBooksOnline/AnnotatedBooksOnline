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
     * Constructs a new PendingUser based on an existing User. This method will also generate a 
     * confirmation code and set a expiration date. Accepted will be set to NULL.
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
        $expirationDate = time() + 7 * 24 * 60 * 60;
        
        $values = array(
            'userId'           => $user->getUserId(),
            'confirmationCode' => Authentication::generateUniqueToken(),
            'expirationDate'   => $expirationDate
        );
        
        $result->setValues($values);
        
        return $result;
    }
    
    /**
     * Get the name of the corresponding table.
     */
    public static function getTableName()
    {
        return 'PendingUsers';
    }
    
    /**
     * Get an array with the primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('pendingUserId');
    }
    
    /**
     * Gets all the columns that are not primary keys as an array.
     */
    public static function getColumns()
    {
        return array('userId', 'confirmationCode', 'expirationDate');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'pendingUserId'    => 'int',
            'userId'           => 'int',
            'confirmationCode' => 'string',
            'expirationDate'   => 'date'
        );
    }
    
    /**
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
