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
 * Exceptions.
 */
class UserNotFoundException extends ExceptionBase
{
    public function __construct($username)
    {
        parent::__construct('user-not-found', $username);
    }
}

class UserBannedException extends ExceptionBase
{
    public function __construct($username)
    {
        parent::__construct('user-banned', $username);
    }
}

class UserPendingException extends ExceptionBase
{
    public function __construct($username)
    {
        parent::__construct('user-pending', $username);
    }
}

class UserShouldActivateException extends ExceptionBase
{
    public function __construct($username)
    {
        parent::__construct('user-should-activate', $username);
    }
}

/**
 * Class representing a user entity.
 */
class User extends Entity
{
    
    /** Rank constants: gaps in numbers are intentional to add more ranks if needed. */
    const RANK_NONE      =  0; // Not logged on.
    const RANK_DEFAULT   = 10; // A normal registered user.
    const RANK_MODERATOR = 40; // A moderator.
    const RANK_ADMIN     = 50; // An administrator.
    
    /** Activation stage constants. */
    const ACTIVE_STAGE_PENDING  = 0; // Just registered, awaiting activation.
    const ACTIVE_STAGE_ACCEPTED = 1; // Accepted, an activation mail should've been send.
    const ACTIVE_STAGE_DENIED   = 2; // Activation denied by administrator.
    const ACTIVE_STAGE_ACTIVE   = 3; // Activated. User can log in.
    
    /** User id. */
    protected $userId;
    
    /** Username. */
    protected $username;
    
    /** Password hash. */
    protected $passwordHash;
    
    /** Email address. */
    protected $email;
    
    /** First name. */
    protected $firstName;
    
    /** Last name. */
    protected $lastName;
    
    /** Affiliation. */
    protected $affiliation;
    
    /** Occupation. */
    protected $occupation;
    
    /** Home address. */
    protected $homeAddress;
    
    /** Website. */
    protected $website;
    
    /** The activation stage of the user. */
    protected $activationStage;
    
    /** Whether this user is banned. */
    protected $banned;
    
    /** Rank number. */
    protected $rank;
    
    /** Password restoration token. */
    protected $passwordRestoreToken;
    
    /** Registration date of this user. */
    protected $registrationDate;
    
    /** Timestamp this user has last logged in. */
    protected $lastActive;
    
    /**
     * Constructs a user by id.
     *
     * @param  $id  Id of the user. Default (null) will create a new user.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->userId = $id;
            
            $this->load();
        }
    }
    
    /**
     * Constructs a user by username and password. Also check whether the user is allowed to log 
     * in. If that is not the case, an exception is thrown. 
     *
     * @param  $username  Username of the user.
     * @param  $password  Password of the user.
     *
     * @return  The matching user.
     * 
     * @throws UserBannedException    If the user is banned.
     * @throws UserPendingException   If the user is not yet activated.
     * @throws UserNotFoundException  If no user with the provided username/password 
     *                                combination exists.
     */
    public static function fromUsernameAndPassword($username, $password)
    {
        $user = User::fromUsername($username);
        
        if (!$user->hasPassword($password))
        {
            throw new UserNotFoundException($username);
        }
        
        // Check for if user is banned.
        if($user->isBanned())
        {
            throw new UserBannedException($username);
        }
        
        // Check whether user is inactive and, if not, why.
        $stage = $user->getActivationStage();
        switch($stage)
        {
            case self::ACTIVE_STAGE_PENDING:
                throw new UserPendingException($username);
            case self::ACTIVE_STAGE_ACCEPTED:
                throw new UserShouldActivateException($username);
            case self::ACTIVE_STAGE_DENIED:   
                throw new UserBannedException($username);
            case self::ACTIVE_STAGE_ACTIVE:
                // User is active.
                break;
        }
        
        if ($user->getPasswordRestoreToken() !== null)
        {
            // Apperantly the user remembered his/her password again. In that case we can remove
            // the password token.
            Log::info('Removing password restore token for %s.', $username);
            
            $user->setPasswordRestoreToken(null);
            $user->save();
        }
        
        return $user;
    }
   
    /**
     * Creates a user entity based on an e-mail address.
     * 
     * @param string $email An e-mail address.
     * 
     * @return User The user entity with this e-mail address, or null if there is no user with
     *              this e-mail.
     */
    public static function fromEmailAddress($email)
    {
        $row = Query::select('userId')
             ->from('Users')
             ->where(array('email = :email'))
             ->execute(array('email' => $email))
             ->tryGetFirstRow();
        
        if ($row !== null)
        {
            return new User($row->getValue('userId'));
        }
        else
        {
            return null;
        }
    }
    
    /**
     * Loads the user with the specified username.
     * 
     * @param string $username The name of the user to load.
     * 
     * @return User A fully loaded user entity of the user with this name.
     * 
     * @throws EntityException If the user does not exist.
     */
    public static function fromUsername($username)
    {
        $row = Query::select('userId')
             ->from('Users')
             ->where('username = :username')
             ->execute(array('username' => $username))
             ->tryGetFirstRow();
        
        if ($row !== null)
        {
            return new User($row->getValue('userId'));
        }
        else
        {
            return null;
        }
    }
    
    /**
     * Checks the password of the userId.
     *
     * @param  $userId  UserId of the user.
     * @param  $password  Password of the user.
     *
     * @return  Correctness of password.
     */
    public static function checkPassword($userId, $password)
    {
        try
        {
            $user = new User($userId);
        }
        catch (Exception $e)
        {
            sleep(2);
            return false;
        }
        return $user->hasPassword($userId);
    }
    
    /**
     * Deletes this user. References to this user will be referred to by a dummy user.
     * 
     * The user id of the entity should be set before calling this.
     */
    public function delete()
    {
        Database::getInstance()->startTransaction();
        
        // Get the user id of the deleted dummy user.
        $newId = Setting::getSetting('deleted-user-id');
        
        // Make sure its not the dummy user itself that is being deleted.
        if($newId === $this->getUserId())
        {
            throw new EntityException();
        }
            
        // All tables that need a userId foreign key set to the special deleted user after
        // deleting this user.
        $refTables = array('Uploads', 'Bindings');
            
        // Update references.
        foreach ($refTables as $table)
        {
            Query::update($table, array('userId' => ':newId'))
                ->where('userId = :oldId')
                ->execute(array('oldId' => $this->getUserId(), 'newId' => $newId));
        }
        
        // Also change Annotations user ids, which have a different name.
        Query::update('Annotations', array('createdUserId' => ':newId'))
            ->where('createdUserId = :oldId')
            ->execute(array('oldId' => $this->getUserId(), 'newId' => $newId));
        Query::update('Annotations', array('changedUserId' => ':newId'))
            ->where('changedUserId = :oldId')
            ->execute(array('oldId' => $this->getUserId(), 'newId' => $newId));
            
        // Now the user can safely be deleted, as the DBMS will automatically delete
        // associated notes and shelves etc.
        parent::delete();
        
        Database::getInstance()->commit();
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'Users';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('userId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('username', 'passwordHash', 'email', 'firstName', 'lastName',
                     'affiliation', 'occupation', 'website', 'homeAddress', 'activationStage',
                     'banned', 'rank', 'passwordRestoreToken', 'registrationDate', 'lastActive');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'userId'               => 'int',
            'username'             => 'istring', // Usernames should be compared case-insensitively.
            'passwordHash'         => 'string',
            'email'                => 'istring',
            'firstName'            => 'string',
            'lastName'             => 'string',
            'affiliation'          => 'string',
            'occupation'           => 'string',
            'website'              => 'string',
            'homeAddress'          => 'string',
            'activationStage'      => 'int',
            'banned'               => 'boolean',
            'rank'                 => 'int',
            'passwordRestoreToken' => 'string',
            'registrationDate'     => 'date',
            'lastActive'           => 'timestamp'
        );
    }
    
    /**
     * Getters and setters.
     */
    
    public function getUserId()    { return $this->userId; }
    
    public function getUsername()          { return $this->username;      }
    public function setUsername($username) { $this->username = $username; }
    
    public function setPassword($password)
    {
        require_once 'models/user/password.php';
        $this->passwordHash = hashPassword($password, $this);
    }
    
    public function hasPassword($password)
    {
        require_once 'models/user/password.php';
        return verifyPassword($password, $this->passwordHash, $this);
    }
    
    public function getEmail()       { return $this->email;   }
    public function setEmail($email) { $this->email = $email; }
    
    public function getFirstName()           { return $this->firstName;       }
    public function setFirstName($firstName) { $this->firstName = $firstName; }
    
    public function getLastName()          { return $this->lastName;      }
    public function setLastName($lastName) { $this->lastName = $lastName; }
    
    public function getAffiliation()             { return $this->affiliation;         }
    public function setAffiliation($affiliation) { $this->affiliation = $affiliation; }
    
    public function getOccupation()            { return $this->occupation;        }
    public function setOccupation($occupation) { $this->occupation = $occupation; }
    
    public function getWebsite()         { return $this->website;     }
    public function setWebsite($website) { $this->website = $website; }
    
    public function getHomeAddress()         { return $this->homeAddress;     }
    public function setHomeAddress($address) { $this->homeAddress = $address; }
    
    public function getBanned()        { return $this->banned;    }
    public function setBanned($banned) { $this->banned = $banned; }
    public function isBanned()         { return $this->banned;    }
    
    public function getRank()      { return $this->rank;  }
    public function setRank($rank) { $this->rank = $rank; }
    
    public function getPasswordRestoreToken()       { return $this->passwordRestoreToken;   }
    public function setPasswordRestoreToken($token) { $this->passwordRestoreToken = $token; }
    
    public function getActivationStage()       { return $this->activationStage;   }
    public function setActivationStage($stage) { $this->activationStage = $stage; }
    
    public function getRegistrationDate()       {  return $this->registrationDate; }
    public function setRegistrationDate($registrationDate) { $this->registrationDate = $registrationDate; }
    
    public function getLastActive()       { return $this->lastActive;  }
    public function setLastActive($lastActive) { $this->lastActive = $lastActive; }
    
    // Active getters are redirected to activation stage. 
    public function getActive()        
    {
        if($this->activationStage === null)
        {
            return null;
        }
        else
        {
            return $this->activationStage == self::ACTIVE_STAGE_ACTIVE;
        }
    }
    
    public function isActive() { return $this->getActive(); }
}

