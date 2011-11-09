<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Authentication controller class.
 */
class AuthenticationController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    public function actionLogin($data)
    {
        // Get fields.
        $username = self::getString($data, 'username', '', true, 25);
        $password = self::getString($data, 'password', '', false, 32);
        
        // Login.
        $user = Authentication::getInstance()->login($username, $password);
        
        return array('userId' => $user->getId());
    }
    
    public function actionLogout($data)
    {
        // Logout.
        Authentication::getInstance()->logout();
    }
}
