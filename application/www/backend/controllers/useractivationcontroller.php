<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'models/user/pendinguser.php';
require_once 'util/mailer.php';

// Exceptions.
class UserActivationException extends ExceptionBase { }

/**
 * User activation controller class.
 */
class UserActivationController extends Controller
{
    /**
     * Accept or decline a pending user. If either is succesfull, the user will be send an e-mail.
     * If the user was accepted the e-mail will also contain a confirmation code.
     * 
     * @param $data Should have 'username' and 'accepted' entries; the latter indicated whether to 
     *              accept or decline.
     * 
     * @throws UserActivationException
     */
    public function actionSetUserAccepted($data)
    {
        // Assert permission.
        Authentication::assertPermissionTo('accept-registrations');
        
        // Fetch name of user to accept or decline.
        $username = self::getString($data, 'username');
        
        // Check whether to accept or decline user.
        $accepted = self::getBoolean($data, 'accepted');
        
        // Start a transaction.
        Database::getInstance()->doTransaction(
        function() use ($username, $accepted)
        {
            //Find corresponding user.
            $user = User::fromUsername($username);
            if ($user === null)
            {
                throw new UserActivationException('user-does-not-exist', $username);
            }
            
            // Find associated PendingUser.
            $row = Query::select('pendingUserId')
                        ->from('PendingUsers')
                        ->where('userId = :userId')
                        ->execute(array('userId' => $user->getUserId()))
                        ->tryGetFirstRow();
            if ($row === null)
            {
                throw new UserActivationException('user-not-pending');
            }
            
            $pendingUser = new PendingUser($row->getValue('pendingUserId'));
            $pendingUser->load();
            
            // Check whether the user is waiting for activation.
            if ($pendingUser->getAccepted() !== null)
            {
                throw new UserActivationException('activation-already-handled');
            }
            
            //Accept or decline user.
            $pendingUser->setAccepted($accepted);
            $pendingUser->save();
            
            // Mailing is part of the transaction. Meaning database changes will be rolled back if
            // it fails.
            if ($accepted)
            {
                // User is accepted: send an activation mail.
                Mailer::sendActivationMail($pendingUser);
            }
            else
            {
                // User is denied. Inform him/her.
                Mailer::sendUserDeclinedMail($pendingUser); 
            }
        });
    }
    
    /**
     * Activates a user based on a activation token. If the code matches with an existing pending 
     * user, this sets the active bit of the user to true and deletes the pending user entry.
     * 
     * @param $data Should contain a 'token', which is the confirmation code of the activation.
     */
    public function actionActivateUser($data)
    {
        // Is done by a currently logged off guest, therefore no authentication check.
        
        // Fetch activation token.
        $token = self::getString($data, 'token');
        
        // Start a transaction.
        $success = Database::getInstance()->doTransaction(
        function() use ($token)
        {
            // Determine to which accepted pending user the token belongs.
            $result = Query::select('pendingUserId', 'userId')
                           ->from('PendingUsers')
                           ->where('confirmationCode = :token')
                           ->where('accepted = :accepted')
                           ->execute(array('token' => $token, 'accepted' => true));
            
            // Try to fetch row.
            $row = $result->tryGetFirstRow();
            if ($row === null)
            {
                // TODO: Exception or more informative return value? (Gerben: Indeed, throw an exception)
                Log::debug('Activation failed.');
                return false;
            }
            
            // Get id's.
            $puser = $row->getValue('pendingUserId');
            $user  = $row->getValue('userId');
            
            // Set the active flag for the user.
            $query = Query::update('Users', array('active' => true))->where('userId = :userId');
            $query->execute(array('userId' => $user));
            
            // Erase this user's column from the pending users table.
            $query = Query::delete('PendingUsers')->where('pendingUserId = :pendingUserId');
            $query->execute(array('pendingUserId' => $puser));
            
            Log::debug('Activation success.');
            return true;
        });
        
        // TODO: Just throw an exception on failure.
        
        return $success;
    }
    
    /**
     * Turns automatic user acceptance on or off. When off, administrators will manually have to
     * accept or decline registrations. If on, registrations are accepted automatically.
     * 
     * In both cases users will still require to click an activation link though.
     * 
     * @param $data Should contain a boolean 'auto-accept', which is true if the setting should be
     *              turned on and false if it should be turned off.
     */
    public function actionSetAutoAcceptance($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('change-global-settings');
        
        // Fetch wheter to turn automatic acceptance on or off.
        $newValue = self::getBoolean($data, 'auto-accept');
        
        Setting::setSetting('auto-user-acceptance', $newValue ? '1' : '0');
    }
    
    /**
     * Sends another activation mail in case a user did not receive or lost the initial one.
     * 
     * @param $data Should contain the 'username' of the user to whom to send a new e-mail.
     * 
     */
    public function actionResendActivationMail($data)
    {
        // Determine user.
        $user = User::fromUsername(self::getString($data, 'username'));
        
        // Find associated PendingUser.
        $row = Query::select('pendingUserId')
                    ->from('PendingUsers')
                    ->where('userId = :userId')
                    ->execute(array('userId' => $user->getUserId()))
                    ->tryGetFirstRow();
        if ($row === null)
        {
            throw new UserActivationException('user-not-pending');
        }
    
        // Make sure user is accepted.
        $puser = new PendingUser($row->getValue('pendingUserId'));
        if($puser->getAccepted() !== true)
        {
            throw new UserActivationException('user-not-accepted');
        }
        
        // Send the activation mail again.
        Mailer::sendActivationMail($puser);
    }
}
