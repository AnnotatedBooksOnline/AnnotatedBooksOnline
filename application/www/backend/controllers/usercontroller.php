<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';
require_once 'model/user/usersearchlist.php';
require_once 'model/user/pendinguser.php';

/**
 * User controller class.
 */
class UserController extends Controller
{
    /**
     * 
     * 
     */
    protected function __construct()
    {
        ;
    }
    
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
            'active'      => '1', // TODO: Activation
            'banned'      => '0', // TODO: Typing, to allow a boolean.
            'rank'        => User::RANK_ADMIN
        );
        
        $user = new User($userId);
        $user->setValues($values);
        $user->save();
        
        return array(
            'records' => $user->getValues(),
            'total'   => 1
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
            'affiliation' => $affiliation,
            'occupation'  => $occupation,
            'homeAddress' => $homeAddress,
            'website'     => $website,
            'active'      => '1', //'0',
            'banned'      => '0', // TODO: Typing, to allow a boolean.
            'rank'        => User::RANK_ADMIN //TODO: Regular user rank.
        );
     
        // Create user and pendinguser entries in a transaction.
        Database::getInstance()->doTransaction(
        function() use ($values, $password)
        {  
            // Create user entry.
            $user = new User();
            $user->setValues($values);
            $user->setPassword($password);
            $user->save();
            
            // Now create a pending user.
//             $puser = PendingUser::fromUser($user);
//             $puser->save();
        });
        
        
        //TODO: Notify user of confirmation code by e-mail.
        
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
        
        // Return <code>true</code> if there is atleast 1 user with the specified email.
        return (bool) UserSearchList::findUsers(array('email' => $email), null, null, null)->
            getAmount();
    }
    
    /**
     * Deletes an user.
     */
    public function actionDeleteUser($data)
    {
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // Deletes the user from the database with this username.
        $query = Query::delete('Users')->where('username = :username');
        
        $query->execute(array('username' => $username));
    }
    
    /**
     * Bans a user.
     */
    public function actionBanUser($data)
    {
        // Fetch username.
        $username = self::getString($data, 'username', '', true, 30);
        
        // Sets the ban flag for this user.
        $query = Query::update('Users', array('banned' => '1'))->where('username = :username');
        
        $query->execute(array('username' => $username));
    }
    
    /**
     * Activates a pending user by setting the active-flag and removing the PendingUser entry. 
     */
    public function actionActivateUser($data)
    {
        // Fetch user id.
        $uid = self::getInteger($data, 'id');
        
        //Start a transaction.
        Database::getInstance()->startTransaction();
        
        // Sets the active flag for this user.
        $query = Query::update('Users', array('active' => '1'))->where('userId = :uid');
        $query->execute(array('uid' => $uid));
        
        // Erases this user's column from the PendingUser table.
        $query = Query::delete('PendingUsers')->where('userId = :uid');
        $query->execute(array('uid' => $uid));
        
        // Commit the transaction.
        Database::getInstance()->commit();
    }
}
