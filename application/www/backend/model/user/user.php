<?php 
//[[GPL]]

require_once 'framework/database/entity.php';

/**
 * Class representing a user entity. 
 *
 * ! Example implementation, not based on the data model !
 */
class User extends Entity
{
    /* NB : I just made up some attributes to server as an example */
    
    
    /** Rank constants. */
    const RANK_NONE      = 0;
    const RANK_MODERATOR = 1;
    const RANK_ADMIN     = 2;
    
    /** Id. */
    private $id;
    
    /** Username. */
    private $username;
    
    /** User password. */
    private $password;
    
    /** User first name. */
    private $firstName;
    
    /** User last name. */
    private $lastName;
    
    /** Rank. */
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
            $this->id = $id;
            
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
        // TODO: Really implement this.
        
        $user = new User();
        $user->setId(3);
        $user->setUsername($username);
        $user->setPassword($password);
        
        return $user;
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
        return array('id');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    protected function getColumns()
    {
        return array('username', 'password', 'firstName', 'lastName', 'rank');
    }
    
    /*
     * Getters and setters.
     */
    
    public function setId($id) { $this->id = $id;  }
    public function getId()    { return $this->id; }
    
    public function setUsername($username) { $this->username = $username; }
    public function getUsername()          { return $this->username;      }
    
    public function setPassword($password) { $this->password = $password; } // TODO: Hash it.
    
    public function setFirstName($firstName) { $this->firstName = $firstName; }
    public function getFirstName()           { return $this->firstName;       }
    
    public function setLastName($lastName) { $this->lastName = $lastName; }
    public function getLastName()          { return $this->lastName;      }
    
    public function setRank($rank) { $this->rank = $rank; }
    public function getRank()      { return $this->rank;  }
}
