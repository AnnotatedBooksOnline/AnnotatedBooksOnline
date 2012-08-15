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
        
        if($user === null)
        {
            throw new UserNotFoundException($username);
        }
        
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
     * @return User A fully loaded user entity of the user with this name, or null if this user does not exist.
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
     * Calculates a secure hash for the given password.
     *
     * @return  A secure hash for the given password.
     */
    private static function hashPassword($password, $extra)
    {
        // Generate a salt based on the password and extra information.
        // First, we retrieve the system salt, which should be unique but does not have to
        // be kept secure.
        $plainsalt = Configuration::getInstance()->getString('password-salt');
        // We use the system salt and the extra information to generate 
        // Still, it would be nice if the salt would change if the user changes the
        // password. It is bad practice to incorporate the password in the salt, since it
        // is stored in plaintext. Therefore, we use two first hex characters of the SHA-1
        // hash of the password as well.
        // This does not really help the attacker: but we have to keep in mind that it
        // reduces the bruteforce attack complexity by a constant factor 16, assuming
        // the real hashing function is way harder to compute than SHA-1. On the other
        // hand, it helps protecting the user by giving a 99.6% chance of a salt change
        // after a password change, thereby offering some more protection against rainbow
        // tables: for each tuple of system salt and extra information, there can be 256
        // different salts.
        $salt = md5($extra . '_' . $plainsalt . '_' . 
            substr(sha1($plainsalt . $password . $extra), 0, 2));
        
        // Use Blowfish with 1024 passes to generate a sufficiently secure password.
        // This function is so hard to compute that the factor 256 bruteforce time
        // reduction (assuming the attacker knows the salt!) does not make it feasible to
        // perform an actual bruteforce attack.
        $algorithm = '$2a';
        $passes    = '$10';
        // Only the first 22 salt characters are used by Blowfish.
        $config    = $algorithm . $passes . '$' . substr($salt, 0, 22);
        $hash = crypt($password, $config);
        
        // We now have a hash, but it contains the salt we used as well as the exact
        // hashing parameters. It would be nice if we could keep this secret.
        // This does not add real cryptographic security (assuming Kerckhoffs' principle),
        // but why not make attacks without access to the filesystem a little harder?
        $hash = substr($hash, strlen($config));
        
        // The string 'p1_' is prepended to the hash, so we will be able to lookup which
        // algorithm was used in the future.
        return 'p1_' . $hash;
    }
    
    /**
     * DEPRECATED. Calculates a not so secure hash for the given password.
     *
     * This hash function helps the bruteforce attacker too much by giving away too much
     * password information in the salt.
     *
     * @return  A secure hash for the given password.
     */
    private static function old_hashPassword($password)
    {
        // Generate a salt based on the password. This salt needs to be secure, as it is
        // prefixed to the password hash.
        $plainsalt = Configuration::getInstance()->getString('password-salt');
        $salt = md5($plainsalt . '_' . substr(sha1($password), 0, 5));
        
        // Use Blowfish with 1024 passes to generate a sufficiently secure password.
        $algorithm = '$2a';
        $passes    = '$10';
        
        return crypt($password, $algorithm . $passes . '$' . $salt);
    }
    
    /**
     * Returns the version of the hashing algorithm used to compute the given hash.
     */
    private static function getHashVersion($hash)
    {
        if (substr($hash, 0, 3) === 'p1_')
        {
            return 1;
        }
        return 0;
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
        $this->passwordHash = self::hashPassword($password, $this->userId);
    }
    
    public function hasPassword($password)
    {
        $version = self::getHashVersion($this->passwordHash);
        if ($version === 1)
        {
            return $this->passwordHash === self::hashPassword($password, $this->userId);
        }
        
        $ok = false;
        switch($version)
        {
            case 0:
                $ok = ($this->passwordHash === self::old_hashPassword($password));
                break;
        }
        
        if ($ok === true)
        {
            $this->setPassword($password);
            return true;
        }
        
        sleep(2);
        return false;
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

