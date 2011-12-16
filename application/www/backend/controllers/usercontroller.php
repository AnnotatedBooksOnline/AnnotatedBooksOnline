<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'model/user/usersearchlist.php';
require_once 'model/user/pendinguser.php';
require_once 'util/mailer.php';

/**
 * User controller class.
 */
class UserController extends Controller
{
    /*
    
    Load:
        - id
        - page
        - offset
        - limit
        - sorters: [ {column, direction}, {column, direction}, .. ]
        - groupers: ?
        - filters: ?
    
    Save:
        - record: {id, ..}
    
    Create:
        - record: {id, ..}
    
    Delete:
        - record: {id, ..}
    
    */
    
    /**
     * Loads user(s).
     */
    public function actionLoad($data)
    {
        // Assert that the user is authenticated. 
        Authentication::assertLoggedOn();
        
        // Determine the total number of users.
        $total = UserSearchList::findUserCount();
        
        // Retrieve the user id of a specific user from the request.
        $id = self::getInteger($data, 'id', 0);
        
        // Retrieve the limit and offset for the search from the request.
        $limit  = self::getInteger($data, 'limit',  $total, true, 0, $total);
        $offset = self::getInteger($data, 'offset', 0,      true, 0, $total);
        
        // Determine id a specific user was requested. If this is the case retrieve this
        // user from the database and return.
        if ($id)
        {
            $user = new User($id);
            
            // TODO: Do a security check on id!
            
            return array('records' => $user->getValues(), 'total' => 1);
        }
        
        // TODO: Do a security check on user kind.
        
        // Retrieve the search filters from the request.
        $arguments = array();
        $filters = self::getArray($data, 'filters');
        if (isset($data['filters']))
        {
            $filterProperties = array();
            foreach ($filters as $filter)
            {
                $column = self::getString($filter, 'column');
                $value  = self::getString($filter, 'value');
                if ($column && $value)
                {
                    $arguments[$column] = $value;
                }
            }            
        }
        
        // Retrieve the sortings from the request.
        $order = array();
        $sorters = self::getArray($data, 'sorters');
        if ($sorters)
        {
            foreach ($sorters as $sorting)
            {
                $column    = self::getString($sorting, 'column');
                $direction = self::getString($sorting, 'direction');
                if ($column && $direction)
                {
                    $order[$column] = $direction;
                }
            }
        }
        
        // Query the Users table.
        $result = UserSearchList::findUsers($arguments, $offset, $limit, $order);

        // Return the results.
        return array(
            'records' => $result->asArrays(),
            'total'   => $total
        );
    }
    
    /**
     *
     *
     */
    public function actionSave($data)
    {
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check on id!
        
        // TODO: Handle changing of passwords.
        
        $record = self::getArray($data, 'record');
        
        $userId      = self::getInteger($record, 'userId', 0);
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
            //'password'    => $password,
            'affiliation' => $affiliation,
            'occupation'  => $occupation,
            'homeAddress' => $homeAddress,
            'website'     => $website,
            'homeAddress' => '',
            'active'      => true, // TODO: Activation.
            'banned'      => false,
            'rank'        => User::RANK_ADMIN, // TODO: Handle ranks.
        );
        
        $user = new User($userId);
        $user->setValues($values);
        $user->save();
        
        return array(
            'records' => $user->getValues(), // TODO: Not all of them.
            'total'   => 1,
        );
    }
    
    /**
     *
     *
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
            'active'      => true,
            'banned'      => false,
            'rank'        => User::RANK_ADMIN, // TODO: Handle ranks.
        );
     
        // Create user and pendinguser entries in a transaction.
        $puser = Database::getInstance()->doTransaction(
        function() use ($values)
        {  
            // Create user entry.
            $user = new User();
            $user->setValues($values);
            $user->save();
            
            // Now create a pending user.
//             $puser = PendingUser::fromUser($user);
//             $puser->save();
//             return $puser;
        });
        
        //Mailer::getInstance()->sendActivationMail($puser);
        
        return array('records' => $values); 
    }
    
    /**
     * Checks whether a username already exists.
     */
    public function actionUsernameExists($data)
    {
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // Return true if there is atleast one user with the specified username.
        return (bool) UserSearchList::findUsers(array('username' => $username), null, null, null)->
            getAmount();
    }
    
    /**
     * Checks whether an email address already exists.
     */
    public function actionEmailExists($data)
    {
        // Fetch email.
        $email = self::getString($data, 'email', '', true, 256);
        
        // Fetch user id of currently logged on user.
        $user = Authentication::getInstance()->getUser();
        $userId = ($user !== null) ? $user->getUserId() : 0;
        
        // Create selection query.
        $query = Query::select('userId')
            ->from('Users')
            ->where('userId != :userId', 'email = :email');
        
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
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check!
        
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // TODO: Move code below to user model.
        
        // Deletes the user from the database with this username.
        $query = Query::delete('Users')->where('username = :username');
        
        $query->execute(array('username' => $username));
    }
    
    /**
     * Bans a user.
     */
    public function actionBanUser($data)
    {
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check!
        
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // TODO: Move code below to user model.
        
        // Sets the ban flag for this user.
        $query = Query::update('Users', array('banned' => true))->where('username = :username');
        
        $query->execute(array('username' => $username));
    }
    
    /**
     * Activates a pending user by setting the active-flag and removing the PendingUser entry. 
     */
    public function actionActivateUser($data)
    {
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check!
        
        // Fetch user id.
        $userId = self::getInteger($data, 'id');
        
        // TODO: Move code below to user model.
        
        // Start a transaction.
        Database::getInstance()->startTransaction();
        
        // Set the active flag for this user.
        $query = Query::update('Users', array('active' => true))->where('userId = :userId');
        $query->execute(array('userId' => $userId));
        
        // Erase this user's column from the pending users table.
        $query = Query::delete('PendingUsers')->where('userId = :userId');
        $query->execute(array('userId' => $userId));
        
        // Commit the transaction.
        Database::getInstance()->commit();
    }
}
