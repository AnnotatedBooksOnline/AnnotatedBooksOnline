<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'framework/helpers/session.php';

/**
 * Keep alive controller class.
 */
class KeepAliveController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    public function actionKeepAlive($data)
    {
        // Get a session instance to keep it alive.
        Session::getInstance();

        return array();
    }
}
