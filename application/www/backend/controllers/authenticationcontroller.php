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
        $username = isset($data['username']) ? substr(trim($data['username']), 0, 25) : '';
        $password = isset($data['username']) ? substr($data['password'],       0, 32) : '';
        
        // Login.
        Authentication::getInstance()->login($username, $password);
    }
    
    public function actionLogout($data)
    {
        // Logout.
        Authentication::getInstance()->logout();
    }
}
