<?php
//[[GPL]]

require_once 'framework/util/singleton.php';
require_once 'framework/util/session.php';
require_once 'models/user/user.php';

// Exceptions.
class NotLoggedOnException extends ExceptionBase
{
    public function __construct()
    {
        parent::__construct('logon-required');
    }
}

/**
 * Authentication utility class.
 */
class Authentication extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** Currently logged on user */
    private $user;
    
    /** Whether we have fetched the user. */
    private $fetchedUser;
    
    /**
     * Constructs an authentication class instance.
     */
    protected function __construct()
    {
        $this->fetchedUser = false;
    }
    
    /**
     * Gets the currently logged on user.
     *
     * @return  The currently logged on user.
     */
    public function getUser()
    {
        // Lazily fetch user.
        if (!$this->fetchedUser)
        {
            $session = Session::getInstance();
            
            if ($session->exists('userId'))
            {
                $userId = $session->getVar('userId');
                $this->user = new User($userId);
            }
            else
            {
                $this->user = null;
            }
            
            $this->fetchedUser = true;
        }
        
        return $this->user;
    }
    
    /**
     * Gets the user id of the currently logged on user.
     *
     * @return  The user id.
     */
    public function getUserId()
    {
        $user = $this->getUser();
        
        if ($user === null)
        {
            throw new NotLoggedOnException();
        }
        
        return $user->getUserId();
    }
    
    /**
     * Logs a user in.
     *
     * @param  $username  The username of the user to log in.
     * @param  $password  The password of the user to log in.
     *
     * @return  The new user.
     * 
     * @throws UserBannedException    If the user is banned.
     * @throws UserPendingException   If the user is not yet activated.
     * @throws UserNotFoundException  If no user with the provided username/password 
     *                                combination exists.
     */
    public function login($username, $password)
    {
        $currentUser = $this->getUser();
        if ($currentUser != null)
        {
            $this->logout();
        }
        
        $this->user        = User::fromUsernameAndPassword($username, $password);
        $this->fetchedUser = true;
        
        Session::getInstance()->setVar('userId', $this->getUser()->getUserId());
        
        return $this->user;
    }
    
    /**
     * Logs the current user out.
     */
    public function logout()
    {
        $session = Session::getInstance();
        $session->unsetVar('userId');
        
        $this->user        = null;
        $this->fetchedUser = true;
    }
    
    /**
     * Checks a password of an user.
     *
     * @param  $password  The password of the user to check.
     *
     * @return true or false.
     */
    public function checkPassword($password)
    {
        $currentUser = $this->getUser();
        
        return (($currentUser != null) && User::checkPassword($this->getUserId(), $password));
    }
    
    /**
     * Checks whether a user is logged on.
     *
     * @return  Whether a user is logged on.
     */
    public function isLoggedOn()
    {
        // Do it the lazy way.
        if ($this->fetchedUser)
        {
            return isset($this->user);
        }
        else
        {
            return Session::getInstance()->exists('userId');
        }
    }
    
    /**
     * Gets the rank of the current user.
     *
     * @return  The rank of the current user.
     */
    public function getRank()
    {
        $user = $this->getUser();
        return (isset($user) ? $user->getRank() : User::RANK_NONE);
    }
    
    /**
     * Generates a unique token that can be mailed to users and be part of an URL.
     * 
     * @return string A string representing a unique 32-digit hexadecimal number.
     */
    public static function generateUniqueToken()
    {
        // This value needs to be unique.
        return md5(uniqid(true));
    }
    
    /**
     * Asserts that the user is logged on.
     *
     * Throws an NotLoggedOnError in all other cases.
     */
    public static function assertLoggedOn()
    {
        if (!Authentication::getInstance()->isLoggedOn())
        {
            throw new NotLoggedOnException();
        }
    }
}
