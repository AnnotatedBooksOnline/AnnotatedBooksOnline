<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Authentication controller class.
 */
class AuthenticationController extends Controller
{
    /**
     * Login
     */
    public function actionLogin($data)
    {
        // Get fields.
        $username = self::getString($data, 'username', '', true, 30);
        $password = self::getString($data, 'password', '', false, 32);
        
        // Login.
        $user = Authentication::getInstance()->login($username, $password);
        
        $userValues = $user->getValues();
        
        // Add the permissions of this user to the return values.
        $userValues['permissions'] = Authentication::getInstance()->getPermissionList();
        
        return $userValues;
    }
    
    
    /**
     * Logout
     */
    public function actionLogout($data)
    {
        // Logout.
        Authentication::getInstance()->logout();
    }
    
    /**
     * Checks whether to keep alive auser and sends back the results
     */
    public function actionKeepAlive($data)
    {
        // Get an authentication instance.
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
        
        $userValues = $user->getValues();
        
        // Add the permissions of this user to the return values.
        $userValues['permissions'] = Authentication::getInstance()->getPermissionList();
        
        return array('action' => 'login', 'user' => $userValues);
    }
    
    /**
     * Checks whether a user has permission to do something
     */
    public function actionHasPermissionTo($data)
    {
        $action = self::getString($data, 'action');
        
        return Authentication::getInstance()->hasPermissionTo($action);
    }
    
    /**
     * Returns a list of the user's permissions
     */
    public function actionGetPermissionList()
    {
        return Authentication::getInstance()->getPermissionList();
    }
    
    /**
     * Returns a list of a guest's permissions
     */
    public function actionGetGuestPermissionList()
    {
        return Permission::getPermissionListForRank(User::RANK_NONE);
    }
}
