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
            
            // Confirm the user is waiting for activation.
            if ($user->getActivationStage() != User::ACTIVE_STAGE_PENDING)
            {
                throw new UserActivationException('activation-already-handled');
            }
            
            //Accept or decline user.
            $user->setActivationStage($accepted ? User::ACTIVE_STAGE_ACCEPTED
                                                : User::ACTIVE_STAGE_DENIED);
            $user->save();
            
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
            // Determine to which pending user the token belongs.
            $result = Query::select('pendingUserId', 'userId')
                           ->from('PendingUsers')
                           ->where('confirmationCode = :token')
                           ->execute(array('token' => $token));
            
            // Try to fetch row.
            $row = $result->tryGetFirstRow();
            if ($row === null)
            {
                Log::debug('Activation failed.');
                return false;
            }
            
            // Get pending user id.
            $puserId = $row->getValue('pendingUserId');
            
            // Load associated user.
            $user = new User($row->getValue('userId'));
            $user->load();
            
            // Confirm the user is accepted.
            if($user->getActivationStage() != User::ACTIVE_STAGE_ACCEPTED)
            {
                Log::debug('Activation failed.');
                return false;
            }
            
            // Activate the user.
            $user->setActivationStage(User::ACTIVE_STAGE_ACTIVE);
            $user->save();
            
            // Erase this user's column from the pending users table.
            $query = Query::delete('PendingUsers')->where('pendingUserId = :pendingUserId');
            $query->execute(array('pendingUserId' => $puserId));
            
            Log::debug('Activation success.');
            return true;
        });
        
        return $success;
    }
    
    /**
     * Turns automatic user acceptance on or off. When off, administrators will manually have to
     * accept or decline registrations. If on, registrations are accepted automatically.
     * 
     * In both cases users will still require to click an activation link though.
     * 
     * @param $data Should contain a boolean 'autoAccept', which is true if the setting should be
     *              turned on and false if it should be turned off.
     *              Additionally, if autoAccept is true, there should be a boolean 'acceptAllPending'
     *              that indicates whether all users currently waiting for activation should also be
     *              activated.
     */
    public function actionSetAutoAcceptance($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('change-global-settings');
        
        // Fetch wheter to turn automatic acceptance on or off.
        $newValue = self::getBoolean($data, 'autoAccept');
        $acceptAll = $newValue && self::getBoolean($data, 'acceptAllPending');
        
        // Start a transaction.
        Database::getInstance()->doTransaction(
        function() use ($newValue, $acceptAll)
        {
            // Set the setting.
            Setting::setSetting('auto-user-acceptance', $newValue ? '1' : '0');
            
            // If requested, accept all users waiting for acception.
            if($acceptAll)
            {
                $accepted = Query::update('Users', array('activationStage' => User::ACTIVE_STAGE_ACCEPTED))
                                ->where('activationStage = :stage')
                                ->returning('userId')
                                ->execute(array('stage' => User::ACTIVE_STAGE_PENDING));
                
                // Send activation mails.
                foreach($accepted as $row)
                {
                    $userId = $row->getValue('userId');
                    
                    // Find associated PendingUser.
                    $puserId = Query::select('pendingUserId')
                                     ->from('PendingUsers')
                                     ->where('userId = :userId')
                                     ->execute(array('userId' => $userId))
                                     ->tryGetFirstRow()
                                     ->getValue('pendingUserId');
                    
                    // Send mail.
                    Mailer::sendActivationMail(new PendingUser($puserId));
                }
            }
        });
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
        
        // Make sure user is accepted.
        if($user->getActivationStage() != User::ACTIVE_STAGE_ACCEPTED)
        {
            throw new UserActivationException('user-not-accepted');
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
        
        // Send the activation mail again.
        $puser = new PendingUser($row->getValue('pendingUserId'));
        Mailer::sendActivationMail($puser);
    }
}
