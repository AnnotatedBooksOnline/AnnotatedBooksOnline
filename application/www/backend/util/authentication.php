<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';
require_once 'models/usermodel.php';

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
            
            if ($session->exists('userid'))
            {
                $userId = $session->getVar('userid');
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
     * Logs a user in.
     *
     * @param  $username  The username of the user to log in.
     * @param  $password  The password of the user to log in.
     */
    public function login($username, $password)
    {
        $currentUser = $this->getUser();
        if ($currentUser != null)
        {
            // TODO
        }
        
        $this->user        = User::fromUsernameAndPassword($username, $password);
        $this->fetchedUser = true;
    }
    
    /**
     * Logs the current user out.
     */
    public function logout()
    {
        $session = Session::getInstance();
        $session->unsetVar('userid');
        
        $this->user        = null;
        $this->fetchedUser = true;
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
            return Session::getInstance()->exists('userid');
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
}
