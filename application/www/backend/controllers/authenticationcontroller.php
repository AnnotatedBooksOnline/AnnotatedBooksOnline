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
        
        $userValues = $user->getValues(); // TODO: just get the important ones..
        
        // Add the permissions of this user to the return values.
        $userValues['permissions'] = Authentication::getInstance()->getPermissionList();
        
        return $userValues;
    }
    
    public function actionLogout($data)
    {
        // Logout.
        Authentication::getInstance()->logout();
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
        
        $userValues = $user->getValues(); // TODO: just get the important ones..
        
        // Add the permissions of this user to the return values.
        $userValues['permissions'] = Authentication::getInstance()->getPermissionList();
        
        return array('action' => 'login', 'user' => $userValues);
    }
    
    public function actionHasPermissionTo($data)
    {
        $action = self::getString($data, 'action');
        
        return Authentication::getInstance()->hasPermissionTo($action);
    }
    
    public function actionGetPermissionList()
    {
        return Authentication::getInstance()->getPermissionList();
    }
    
    public function actionGetGuestPermissionList()
    {
        return Permission::getPermissionListForRank(User::RANK_NONE);
    }
}
