<?php

require_once 'framework/controller.php';
require_once 'util/authentication.php';

/**
 * Login controller class.
 */
class LoginController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    public function actionLogin($data)
    {
        return array(1, 2, 3);
    }
}
