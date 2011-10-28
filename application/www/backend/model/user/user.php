<?php 

require_once 'framework/database/entity.php';

/**
 * Class representing a user entity. 
 * ! Example implementation, not based on the data model !
 */
class User extends Entity
{
    /* NB : I just made up some attributes to server as an example */
    
    /** User id */
    private $userId;
    
    /** User name. */
    private $username;
    
    /** User password. */
    private $password;
    
    /** User first name. */
    private $firstName;
    
    /** User last name. */
    private $lastName;
    
 
    /**
     * Moves the class instance variables into an array for insertion into a query.
     */
    protected function moveInstanceVarsToAttributes() 
    {
        return array(
               'userId' => $this->userId,
               'username' => $this->username,
               'password' => $this->password,
               'firstName' => $this->firstName,
        	   'lastName' => $this->lastName
            );
    }
    
    /**
     * Moves the result attributes from a query into this classes instance variables.
     * @param resultSetRow Result set row to read the attributes from.
     */
    protected function moveAttributesToInstanceVars($resultSetRow) 
    {
        $this->userId = $resultSetRow->getValue("userId");
        $this->username = $resultSetRow->getValue("username");
        $this->password = $resultSetRow->getValue("password");
        $this->firstName = $resultSetRow->getValue("firstName");
        $this->lastName = $resultSetRow->getValue("lastName");
    }
    
    
    /**
     * Implement in derived class to retrieve attribute (and associactive?) entities.
     */
    public function retrieveDetails() {
        // No attribute entities to retrieve yet.
    }
    
    /**
	 *
     */
    public function saveDetails() {
        /// No attribute entities to save yet.
    }
    
    /**
    * This method returns the SQL needed to select this entity from the database.
    * @return SQL code to select this entity in the database.
    */
    protected function makeSelectSql()
    {
        $query = "SELECT * FROM UserT WHERE userId = :userId";
        return $query;
    }
    
    /**
    * This method returns the SQL needed to insert this entity into the database.
    * @return SQL code to insert this entity in the database.
    */
    protected function makeInsertSql()
    {
        $query  = "INSERT INTO UserT ";
        $query .= "(username, password, firstName, lastName, tsChanged, tsCreated, userCreated, userChanged) ";
        $query .= "VALUES ";
        $query .= "(:username, :password, :firstName, :lastName, current_timestamp, current_timestamp, 'mathijs', 'mathijs')";
        return $query;
    }
    
    /**
     * This method returns the SQL needed to delete this entity from the database.
     * @return SQL code to delete this entity from the database.
     */
    protected function makeDeleteSql()
    {
        $query  = "DELETE FROM UserT ";
        $query .= "WHERE ";
        $query .= "userId = :userId";
        return $query;
    }
    
    /**
     * This method returns the SQL needed to update this entity in the database.
     * @return SQL code to update this entity in the database.
     */
    protected function makeUpdateSql()
    {
        $query  = "UPDATE UserT ";
        $query .= "SET username = :username, password = :password, firstName = :firstname, lastName = :lastName, tsChanged = current_timestamp ";
        $query .= "WHERE ";
        $query .= "userId = :userId";
        return $query;
    }
    
    /**
    * This method determines if the primary key instance variables of this object are filled.
    * @return <code>true</code> if the primary key is filled, otherwise <code>false</code>.
    */
    protected function determineIsPrimaryKeyFilled()
    {
        return isset($this->userId);
    }
    
 
    /*
     * Getters / setters
     */
    public function setUserId($userId) 
    {
        $this->userId = $userId;
    }
    public function getUserId() 
    {
        return $this->userId;
    }
    
    public function setUsername($username)
    {
        $this->username = $username;
    }
    public function getUsername()
    {
        return $this->username;
    }
    
    public function setPassword($password)
    {
        $this->password = $password;
    }
    public function getPassword()
    {
        return $this->password;
    }
    
    public function setFirstName($firstName)
    {
        $this->firstName = $firstName;
    }
    public function getFirstName()
    {
        return $this->firstName;
    }
    
    public function setLastName($lastName)
    {
        $this->lastName = $lastName;
    }
    public function getLastName()
    {
        return $this->lastName;
    }

    
}