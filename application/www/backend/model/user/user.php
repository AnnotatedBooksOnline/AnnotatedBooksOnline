<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

// Exceptions.
class UserNotFoundException extends ExceptionBase {
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
    
    
    /** User ID */
    private $userId;
    
    /** Username */
    private $username;
    
    /** Password hash */
    private $passwordHash;
    
    /** Email address */
    private $email;
    
    /** First name */
    private $firstName;
    
    /** Last name */
    private $lastName;
    
    /** Affiliation */
    private $affiliation;
    
    /** Occupation */
    private $occupation;
    
    /** Home address */
    private $homeAddress;
    
    /** Website */
    private $website;
    
    /** Whether this User is active */
    private $active;
    
    /** Whether this User is banned */
    private $banned;
    
    /** Rank number */
    private $rank;
    
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
        
        $result = $query->execute(array('username' => $username, 'hash' => self::secureHash($password)));
        if ($result->getAmount() == 1)
        {
            return new User($result->getValue('userId'));
        }
        else
        {
            throw new UserNotFoundException($username);
        }
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
        $salt = md5('user' . $password); // TODO: use salt.
        
        // Use Blowfish with 1024 passes to generate a sufficiently secure password.
        $algorithm = '$2a';
        $passes = '$10';
        return crypt($password, $algorithm . $passes . '$' . $salt);
    }
    
    /*
     * Getters and setters.
     */

    public function getId()
    {
        return $this->userId;
    }
    
    public function getUsername()
    {
        return $this->username;
    }
    public function setUsername($username)
    {
        $this->username = $username;
    }
    
    public function setPassword($password)
    {
        $this->passwordHash = self::secureHash($password);
    }
    
    public function getFirstName()
    {
        return $this->firstName;
    }
    public function setFirstName($firstName)
    {
        $this->firstName = $firstName;
    }
    
    public function getLastName()
    {
        return $this->lastName;
    }
    public function setLastName($lastName)
    {
        $this->lastName = $lastName;
    }
    
    public function getRank()
    {
        return $this->rank;
    }
    public function setRank($rank)
    {
        $this->rank = $rank;
    }
}
