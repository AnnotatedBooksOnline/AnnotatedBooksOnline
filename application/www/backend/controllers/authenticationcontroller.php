<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Authentication controller class.
 */
class AuthenticationController extends Controller
{
    public function actionLogin($data)
    {
        // Get fields.
        $username = self::getString($data, 'username', '', true, 30);
        $password = self::getString($data, 'password', '', false, 32);
        
        // Login.
        $user = Authentication::getInstance()->login($username, $password);
        
        return $user->getValues(); // TODO: just get the important ones..
    }
    
    public function actionLogout($data)
    {
        // Logout.
        Authentication::getInstance()->logout();
    }
{
    public function actionCheckPassword($data)
    {
        // Get field.
        $password = self::getString($data, 'password', '', false, 32);
        
        return Authentication::getInstance()->checkPassword($password);
    }
    
    public function actionKeepAlive($data)
    {
        // Get a authentication instance.
        $auth = Authentication::getInstance();
        
        // Get user id on client.
        $userId = self::getInteger($data, 'userId');
        
        // Check user.
        $user = $auth->getUser();
        if ($userId)
        {
            if ($user === null)
            {
                return array('action' => 'logout');
            }
            else if ($user->getUserId() === $userId)
            {
                return;
            }
        }
        else if ($user === null)
        {
            return;
        }
        
        return array('action' => 'login', 'user' => $user->getValues()); // TODO: just get the important ones..
    }
}
