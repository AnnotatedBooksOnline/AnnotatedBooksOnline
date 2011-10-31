<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'model/user/user.php';

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
        // Create a user object and fill it.
        $user = new User();
        $user->setFirstName("Mathijs");
        $user->setLastName("Baaijens");
        $user->setPassword("test123");
        $user->setUsername("MathijsB");
        
        // Save the user object to the database.
        $user->save();
    }
}
