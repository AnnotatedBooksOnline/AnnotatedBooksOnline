<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

// Exceptions.
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

/**
 * Class representing a user entity.
 */
class User extends Entity
{
    /** Rank constants: gaps in numbers are intentional to add more ranks if needed. */
    const RANK_NONE      =  0; // Not logged on.
    const RANK_DEFAULT   = 10; // A normal registered user.
    const RANK_MODERATOR = 30; // A moderator.
    const RANK_ADMIN     = 50; // An administrator.
    
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
    
    /** Whether this user is active. */
    protected $active;
    
    /** Whether this user is banned. */
    protected $banned;
    
    /** Rank number. */
    protected $rank;
    
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
     * Constructs a user by username and password.
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
        // Get user id from username and password.
        $query = Query::select('userId')->
                 from('Users')->
                 where('username = :username', 'passwordHash = :hash');
        
        $resultSet = $query->execute(array(
            'username' => $username,
            'hash'     => self::secureHash($password)
        ));
        
        if ($resultSet->getAmount() != 1)
        {
            throw new UserNotFoundException($username);
        }
        
        // Fetch user.
        $user = new User($resultSet->getFirstRow()->getValue('userId', 'int'));
        
        // Check for if user is banned or inactive.
        if ($user->isBanned())
        {
            throw new UserBannedException($username);
        }
        else if (!$user->isActive())
        {
            throw new UserPendingException($username);
        }
        
        return $user;
    }
   
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected function getTableName()
    {
        return 'Users';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected function getPrimaryKeys()
    {
        return array('userId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('username', 'passwordHash', 'email', 'firstName', 'lastName',
                     'affiliation', 'occupation', 'website', 'homeAddress', 'active',
                     'banned', 'rank');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    protected function getColumnTypes()
    {
        return array(
            'userId'       => 'int',
            'username'     => 'string',
            'passwordHash' => 'string',
            'email'        => 'string',
            'firstName'    => 'string',
            'lastName'     => 'string',
            'affiliation'  => 'string',
            'occupation'   => 'string',
            'website'      => 'string',
            'homeAddress'  => 'string',
            'active'       => 'boolean',
            'banned'       => 'boolean',
            'rank'         => 'int',
        );
    }
    
    /**
     * Calculates a secure hash for the given password.
     *
     * @return  A secure hash for the given password.
     */
    private static function secureHash($password)
    {
        // DEBUG: For now, so that development works.
        // TODO: Remove the following line.
        return sha1('8!@(*#!HK*@&#*&91' . $password);
        
        
        // Generate a salt based on the password. This salt needs to be secure, as it is prefixed
        // to the password hash.
        $salt = md5($config->getString('password-salt') . '_' . $password);
        
        // Use Blowfish with 1024 passes to generate a sufficiently secure password.
        $algorithm = '$2a';
        $passes = '$10';
        
        return crypt($password, $algorithm . $passes . '$' . $salt);
    }
    
    /*
     * Getters and setters.
     */
    
    public function getUserId()    { return $this->userId; }
    
    public function setUsername($username) { $this->username = $username; }
    public function getUsername()          { return $this->username;      }
    
    public function setPassword($password)
    {
        $this->passwordHash = self::secureHash($password);
    }
    
    public function getEmail()       { return $this->email;   }
    public function setEmail($email) { $this->email = $email; }
    
    public function setFirstName($firstName) { $this->firstName = $firstName; }
    public function getFirstName()           { return $this->firstName;       }
    
    public function setLastName($lastName) { $this->lastName = $lastName; }
    public function getLastName()          { return $this->lastName;      }
    
    public function setAffiliation($affiliation) { $this->affiliation = $affiliation; }
    public function getAffiliation()             { return $this->affiliation;         }
    
    public function setOccupation($occupation) { $this->occupation = $occupation; }
    public function getOccupation()            { return $this->occupation;        }
    
    public function setWebsite($website) { $this->website = $website; }
    public function getWebsite()         { return $this->website;     }
    
    public function setHomeAddress($address) { $this->homeAddress = $address; }
    public function getHomeAddress()         { return $this->homeAddress;     }
    
    public function setActive($active) { $this->active = $active; }
    public function isActive()         { return $this->active;    }
    
    public function setBanned($banned) { $this->banned = $banned; }
    public function isBanned()         { return $this->banned;    }
    
    public function setRank($rank) { $this->rank = $rank; }
    public function getRank()      { return $this->rank;  }
}
