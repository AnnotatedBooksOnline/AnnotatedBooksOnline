<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'util/authentication.php';
require_once 'util/mailer.php';
require_once 'models/user/userlist.php';
require_once 'models/user/pendinguser.php';
require_once 'models/note/note.php';

// Exceptions.
class RegistrationFailedException extends ExceptionBase { }
class PasswordIncorrectException  extends ExceptionBase { }

/**
 * User controller class.
 */
class UserController extends ControllerBase
{
    /**
     * Loads users.
     */
    public function actionLoad($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertPermissionTo('view-users-part');
        
        // Handle load.
        $result = $this->handleLoad($data, 'User', 'userId');
        
        // Get columns that users may see.
        $columns     = array_flip($this->getAccessableColumns());
        $userColumns = array_flip($this->getAccessableColumns(true));
        
        // Get own user id.
        $userId = Authentication::getInstance()->getUserId();
        
        // Remove columns that user does not have access to.
        foreach ($result['records'] as &$record)
        {
            if ($record['userId'] === $userId)
            {
                $record = array_intersect_key($record, $userColumns);
            }
            else
            {
                $record = array_intersect_key($record, $columns);
            }
        }
        
        return $result;
    }
    
    /**
     * Saves a user.
     */
    public function actionSave($data)
    {
        // TODO: Proper permissions.
        Authentication::assertLoggedOn();
        
        // Fetch values.
        $record = self::getArray($data, 'record');
        
        $userId      = self::getInteger($record, 'userId', 0);
        $username    = self::getString($record, 'username', '', true, 30);
        $email       = self::getString($record, 'email', '', true, 255);
        $firstName   = self::getString($record, 'firstName', '', true, 50);
        $lastName    = self::getString($record, 'lastName', '', true, 50);
        $oldPassword = self::getString($record, 'password', '', false, 32);
        $newPassword = self::getString($record, 'newPassword', '', false, 32);
        $affiliation = self::getString($record, 'affiliation', '', true, 50);
        $occupation  = self::getString($record, 'occupation', '', true, 50);
        $homeAddress = self::getString($record, 'homeAddress', '', true, 255);
        $website     = self::getString($record, 'website', '', true, 255);
        
        // TODO: Check everything, as in save.
        
        // Check if a new password is entered, in which case we need to check if the old password
        // is correct.
        if (isset($newPassword) && strlen($newPassword) >= 8)
        {
            if (!Authentication::getInstance()->checkPassword($oldPassword))
            {
                throw new PasswordIncorrectException('password-incorrect');
            }
            else
            {
                $values = array(
                    'username'    => $username,
                    'email'       => $email,
                    'firstName'   => $firstName,
                    'lastName'    => $lastName,
                    'password'    => $newPassword,
                    'affiliation' => $affiliation,
                    'occupation'  => $occupation,
                    'homeAddress' => $homeAddress,
                    'website'     => $website,
                    'homeAddress' => ''
                );
            }
        }
        else
        {
            $values = array(
                'username'    => $username,
                'email'       => $email,
                'firstName'   => $firstName,
                'lastName'    => $lastName,
                'affiliation' => $affiliation,
                'occupation'  => $occupation,
                'homeAddress' => $homeAddress,
                'website'     => $website,
                'homeAddress' => ''
            );
        }
        
        $user = new User($userId);
        $user->setValues($values);
        $user->save();
        
        return array(
            'records' => $user->getValues($this->getAccessableColumns(true)),
            'total'   => 1
        );
    }
    
    /**
     * Creates a user.
     */
    public function actionCreate($data)
    {
        $record = self::getArray($data, 'record');
        
        $username    = self::getString($record, 'username', '', true, 30);
        $email       = self::getString($record, 'email', '', true, 255);
        $firstName   = self::getString($record, 'firstName', '', true, 50);
        $lastName    = self::getString($record, 'lastName', '', true, 50);
        $password    = self::getString($record, 'password', '', false, 32);
        $affiliation = self::getString($record, 'affiliation', '', true, 50);
        $occupation  = self::getString($record, 'occupation', '', true, 50);
        $homeAddress = self::getString($record, 'homeAddress', '', true, 255);
        $website     = self::getString($record, 'website', '', true, 255);
        
        $values = array(
            'username'    => $username,
            'email'       => $email,
            'firstName'   => $firstName,
            'lastName'    => $lastName,
            'password'    => $password,
            'affiliation' => $affiliation,
            'occupation'  => $occupation,
            'homeAddress' => $homeAddress,
            'website'     => $website,
            'active'      => false,
            'banned'      => false,
            'rank'        => User::RANK_DEFAULT
        );
        
        // Check incoming values: username existance, email existance, correct pattern for 
        // username, correct pattern for email and no empty required fields.
        if ($this->actionUsernameExists(array('username' => $username)) 
         || $this->actionEmailExists(array('email' => $email))
         || !preg_match("/^[A-Za-z\d\._'@ ]*$/", $username)
         || !preg_match("/^([\w]+)(.[\w]+)*@([\w-]+\.){1,5}([A-Za-z]){2,4}$/", $email)
         || $username==="" || $email==="" || $firstName==="" || $lastName==="" || $password==="")
        {
            throw new RegistrationFailedException('registration-failed');
        }
        
        // TODO: Check lengths and website.
     
        // Create user and pendinguser entries in a transaction.
        Database::getInstance()->doTransaction(
        function() use ($values)
        {  
            // Check whether automatic user acceptance is turned on.
            $autoAccept = Setting::getSetting('auto-user-acceptance');
            
            // Create user entry.
            $user = new User();
            $user->setValues($values);
            $user->save();
            
            // Now create a pending user.
            $pendingUser = PendingUser::fromUser($user);
            if ($autoAccept)
            {
                // Automatically accept user.
                $pendingUser->setAccepted(true);
            }
            
            $pendingUser->save();
           
            if ($autoAccept)
            {
                // If automatically accepted, send an activation e-mail.
                // This is intentionally part of the transaction.
                Mailer::sendActivationMail($pendingUser);
            }
        });
        
        return array('records' => $values, 'total' => 1); 
    }
    
    /**
     * Checks whether a username already exists as an username or email address.
     */
    public function actionUsernameExists($data)
    {
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        $resultSet = Query::select()
                   ->from('Users')
                   ->whereOr('username ILIKE :username', 'email ILIKE :username')
                   ->execute(array('username' => $username));
                                     
        return (bool) $resultSet->getAmount();
    }
    
    /**
     * Checks whether an email address already exists as an email adress or username.
     */
    public function actionEmailExists($data)
    {
        // Fetch email.
        $email = strtolower(self::getString($data, 'email', '', true, 256));
        
        // Fetch user id of currently logged on user.
        $user = Authentication::getInstance()->getUser();
        $userId = ($user !== null) ? $user->getUserId() : 0;
        
        // Create query.
        $query = Query::select('userId')
            ->from('Users')
            ->where('userId != :userId')
            ->whereOr('username ILIKE :email', 'email ILIKE :email');
        
        // Check if there are rows returned.
        return (bool) $query->execute(
            array('userId' => $userId, 'email' => $email),
            array('userId' => 'int', 'email' => 'string')
        )->getAmount();
    }
    
    /**
     * Deletes an user.
     */
    public function actionDeleteUser($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('delete-users');
        
        // Fetch user.
        $username = self::getString($data, 'username', '', true, 30);
        $user = User::fromUsername($username);
        if ($user === null)
        {
            throw new ControllerException('user-does-not-exist', $username);
        }
        
        // Delete the user.
        $user->delete();
    }
    
    /**
     * Bans a user.
     */
    public function actionBanUser($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('ban-users');
        
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // Sets the ban flag for this user.
        Query::update('Users', array('banned' => true))
            ->where('username = :username')
            ->execute(array('username' => $username));
    }
    
    /**
    * Unbans a user.
    */
    public function actionUnBanUser($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('ban-users');
    
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
    
        // Sets the ban flag for this user.
        Query::update('Users', array('banned' => false))
            ->where('username = :username')
            ->execute(array('username' => $username));
    }
    
    /**
     * Sends an e-mail to the user containing a link with which he/she can enter a new password.
     * 
     * The only information a user needs to specify for this is an e-mail address.
     * 
     * @param $data Should have an 'email' key.
     */
    public function actionPasswordForgotten($data)
    {
        // Retrieve the corresponding user.
        $email = self::getString($data, 'email');
        $user = User::fromEmailAddress($email);
        if ($user == null)
        {
            throw new UserNotFoundException('email-not-found', $email);
        }
        
        // Set restore token in transaction so it is rolled back when the mailer throws an 
        // exception.
        Database::getInstance()->doTransaction(
        function() use ($user)
        {
            // Specify a password restoration token for this user.
            $user->setPasswordRestoreToken(Authentication::generateUniqueToken());
            $user->save();
            
            // Send an e-mail informing the user of the token.
            Mailer::sendPasswordRestorationMail($user);
        });
    }
    
    /**
     * Change the role (rank) of a user.
     * 
     * @param $data Should contain 'username' and 'role', the latter being a number indicating the 
     *              new rank of this user.
     */
    public function actionChangeRole($data)
    {
        // Check permissions.
        Authentication::assertPermissionTo('change-user-roles');
        
        // Fetch username and new role.
        $username = self::getString($data, 'username', '', true, 30);
        $newrank = self::getInteger($data, 'role');
        
        // Change the user rank.
        $user = User::fromUsername($username);
        if ($user === null)
        {
            throw new ControllerException('user-does-not-exist', $username);
        }
        
        $user->setRank($newrank);
        $user->save();
    }
    
    /**
     * Changes a user's forgotten password based on a token.
     * 
     * @param $data Should contain a 'token' and a newly entered 'password'.
     */
    public function actionChangeForgottenPassword($data)
    {
        // Fetch password restoration token.
        $token = self::getString($data, 'token', null, true, 32);
        
        // Fetch new password.
        $newpass = self::getString($data, 'password');
        
        Log::debug('!!!!' . strlen($token) . '!!' . strlen($newpass));
        
        if ($token === null || strlen($token) != 32 || strlen($newpass) == 0)
        {
            Log::debug('Illegal change password token or no password.');
            return false;
        }
        
        // Transaction.
        $success = Database::getInstance()->doTransaction(
        function() use ($token, $newpass)
        {
            // Query for associated user.
            $row = Query::select('userId')
                         ->from('Users')
                         ->where('passwordRestoreToken = :token')
                         ->execute(array('token' => $token))
                         ->tryGetFirstRow();
            if ($row !== null)
            {
                // No user associated with token.
                Log::debug('Token does not correspond to a user.');
                return false;
            }
            
            // Change user password and remove password restoration token.
            $user = new User($row->getValue('userId'));
            $user->setPassword($newpass);
            $user->setPasswordRestoreToken(null);
            $user->save();
            
            return true;
        });
        
        return $success;
    }
    
    /**
     * Gets the array with columns that a logged on user may see.
     * 
     * @param $loggedOnUser  Boolean whether to get columns that the currently
     *                       logged on user may see.
     *
     * @return The array of columns that a user may see.
     */
    private function getAccessableColumns($loggedOnUser = false)
    {
        if (Authentication::getInstance()->hasPermissionTo('view-users-complete'))
        {
            return array('userId', 'username', 'email', 'firstName', 'lastName', 'affiliation',
                         'occupation', 'website', 'homeAddress', 'active', 'banned', 'rank');
        }
        else if($loggedOnUser)
        {
            return array('userId', 'username', 'email', 'firstName', 'lastName', 'affiliation',
                         'occupation', 'website', 'homeAddress', 'rank');
        }
        else if (Authentication::getInstance()->hasPermissionTo('view-users-part'))
        {
            return array('userId', 'username', 'email', 'firstName', 'lastName');
        }
        else
        {
            return array();
        }
    }
}
