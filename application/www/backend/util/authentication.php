<?php

require_once 'framework/helpers/singleton.php';
require_once 'models/usermodel.php';

/**
 * Authentication utility class.
 */
class Authentication extends Singleton
{
    private $user;
    
    /**
     * Constructs a authentication class instance.
     */
    protected function __construct()
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
    }
    
    /**
     * Gets the session singleton instance.
     *
     * @return  The unique instance of the session.
     */
    public static function getInstance()
    {
        return parent::getInstance(__CLASS__);
    }
    
    /**
     * Logs a user in.
     *
     * @param  $username  The username of the user to log in.
     * @param  $password  The password of the user to log in.
     */
    public function login($username, $password)
    {
        $this->user = User::fromUsernameAndPassword($username, $password);
    }
    
    /**
     * Logs the current user out.
     */
    public function logout()
    {
        $session = Session::getInstance();
        $session->unsetVar('userid');
        
        $this->user = null;
    }
    
    /**
     * Checks whether a user is logged on.
     *
     * @return  Whether a user is logged on.
     */
    public function isLoggedOn()
    {
        return isset($this->user);
    }
    
    /**
     * Gets the rank of the current user.
     *
     * @return  The rank of the current user.
     */
    public function getRank()
    {
        return (isset($this->user) ? $this->user->getRank() : User::RANK_NONE);
    }
}
