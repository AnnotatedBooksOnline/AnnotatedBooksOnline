<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

class UserActivationException extends ExceptionBase {}

/**
 * User activation controller class.
 */
class UserActivationController extends Controller
{
    /**
     * Activates a user based on a activation token. If the code matches with an existing pending 
     * user, this sets the active bit of the user to true and deletes the pending user entry.
     */
    public function actionActivateUser($data)
    {
        // Fetch activation token.
        $token = self::getInteger($data, 'token');
        
        // Start a transaction.
        Database::getInstance()->doTransaction(
        function() use ($token)
        {
            // Determine to which user the  token belongs.
            $result = Query::select('pendingUserId', 'userId')->from('PendingUsers')
                                                              ->where('confirmationCode = :token')
                                                              ->execute(array('token' => $token));
            if($result->getAmount() != 1)
            {
                // TODO: Exception or more informative return value?
                return false;
            }
            
            // Get id's.
            $puser = $result->getFirstRow()->getValue('pendingUserId');
            $user  = $result->getFirstRow()->getValue('userId');
            
            // Set the active flag for the user.
            $query = Query::update('Users', array('active' => true))->where('userId = :userId');
            $query->execute(array('userId' => $user));
    
            // Erase this user's column from the pending users table.
            $query = Query::delete('PendingUsers')->where('pendingUserId = :pendingUserId');
            $query->execute(array('pendingUserId' => $puser));
        });
        
        return true;
    }
}