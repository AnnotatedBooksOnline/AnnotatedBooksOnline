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

/**
 * Class representing a user entity.
 */
class User extends Entity
{
    /** Rank constants. */
    const RANK_NONE      = 0;
    const RANK_MODERATOR = 1;
    const RANK_ADMIN     = 2;
    
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
     */
    public static function fromUsernameAndPassword($username, $password)
    {
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
        
        return new User($resultSet->getFirstRow()->getValue('userId'));
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public function save()
    {
        parent::save();
        
        // NOTE: Here, other components can be saved: eg: banned data, etc.
    }
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    protected static function getTableName()
    {
        return 'Users';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    protected static function getPrimaryKeys()
    {
        return array('userId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected static function getColumns()
    {
        return array('username', 'passwordHash', 'email', 'firstName', 'lastName',
                     'affiliation', 'occupation', 'website', 'homeAddress', 'active',
                     'banned', 'rank');
    }
    
    /**
     * Calculates a secure hash for the given password.
     *
     * @return  A secure hash for the given password.
     */
    private static function secureHash($password)
    {
        // Generate a salt based on the user ID. This salt does not have to be secure.
        //$salt = md5('user' . $password); // TODO: use salt.
        
        // Use Blowfish with 1024 passes to generate a sufficiently secure password.
        //$algorithm = '$2a';
        //$passes = '$10';
        //return crypt($password, $algorithm . $passes . '$' . $salt);
        
        // NOTE: crypt support may vary per system, algorithm may also vary.
        // NOTE: so that is not portable.
        
        return sha1('8!@(*#!HK*@&#*&91' . $password);
    }
    
    /*
     * Getters and setters.
     */
    
    // NOTE: (GVV) Please, do keep these one one line, so all the getters and setters don't take up
    // NOTE: (GVV) a million lines.
    
    public function getId() { return $this->id; }
    
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
