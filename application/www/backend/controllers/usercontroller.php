<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'util/authentication.php';

/**
 * Book controller class.
 */
class UserController extends Controller
{
    protected function __construct()
    {
        ;
    }
    
    /*
    
    Load:
        - id
        - page
        - start
        - limit
        - sort: [ {property, direction}, {property, direction}, .. ]
        - filter: ?
    
    Save:
        - record: {id, ..}
    
    Create:
        - record: {id, ..}
    
    Delete:
        - record: {id, ..}
    
    */
    
    public function actionLoad($data)
    {
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        $id = self::getInteger($data, 'id', 0);
        if ($id)
        {
            $user = new User($id);
        
            // TODO: Do a security check on id!
            
            /*
            // TODO: Return just these values:
            
            array(
                'userId'
                'username',
                'email',
                'firstName',
                'lastName',
                'affiliation',
                'occupation',
                'website',
                'homeAddress',
                'rank'
            )
            */
            
            return array('records' => $user->getValues(), 'total' => 1);
        }
        
        // TODO: Do a security check on user kind!
        
        $total = Query::select()->
                 count('userId', 'total')->
                 from('Users')->
                 execute()->
                 getFirstRow()->
                 getValue('total');
        
        $start = self::getInteger($data, 'start', 0,      true, 0, $total);
        $limit = self::getInteger($data, 'limit', $total, true, 0, $total);
        
        $query = Query::select(
            'userId',
            'username',
            'email',
            'firstName',
            'lastName',
            'affiliation',
            'occupation',
            'website',
            'homeAddress',
            'rank'
        )
        ->from('Users')
        ->limit($limit, $start);
        
        $bindings = array();
        
        if (isset($data['filter']))
        {
            $filterProperties = array();
            foreach (json_decode(self::getString($data, 'filter'), true) as $f)
            {
                if (isset($f['property']) && isset($f['value']))
                {
                    array_push($filterProperties, self::getString($f, 'property') . ' = :' . self::getString($f, 'property'));
                    $bindings[self::getString($f, 'property')] = self::getString($f, 'value');
                }
            }
            
            if (count($filterProperties) > 0)
            {
                $query = $query->where($filterProperties);
            }
        }
        
        if (isset($data['sort']))
        {
            foreach (json_decode(self::getString($data, 'sort'), true) as $s)
            {
                if (isset($s['property']) && isset($s['direction']))
                {
                    $query = $query->orderBy(self::getString($s, 'property'), self::getString($s, 'direction'));
                }
            }
        }
        
        $result = $query->execute($bindings)->getIterator();
        
        $records = array();
        foreach ($result as $user)
        {
            $records[] = $user->getValues();
        }
        
        return array(
            'records' => $records,
            'total'   => $total
        );
    }
    
    public function actionSave($data)
    {
        // Check whether logged on.
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check on id!
        
        $record = self::getArray($data, 'record');
        
        $userId      = self::getInteger($record, 'userId', 0);
        $username    = self::getString($record, 'username', '', true, 25);
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
            'homeAddress' => '',
            'active'      => '1', // TODO: Activation
            'banned'      => '0', // TODO: Typing, to allow a boolean.
            'rank'        => User::RANK_ADMIN
        );
        
        $user = new User($userId);
        $user->setValues($values);
        $user->save();
        
        return array(
            'records' => $values,
            'total'   => 1
        );
    }
    
    public function actionCreate($data)
    {
        $record = self::getArray($data, 'record');
        
        $username    = self::getString($record, 'username', '', true, 25);
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
            'active'      => '1', // TODO: Activation.
            'banned'      => '0', // TODO: Typing, to allow a boolean.
            'rank'        => User::RANK_ADMIN
        );
        
        $user = new User();
        $user->setValues($values);
        $user->save();
        
        return array('records' => $values); // TODO: Should this also just be one?
        
        // TODO: Create a pending user.
    }
    
    public function actionUsernameExists($data)
    {
        $username = self::getString($data, 'username', '', true, 25);
        
        $total = Query::select('userId')->
                 from('Users')->
                 where('username = :username')->
                 execute(array('username' => $username))->
                 getAmount();
        
        return (bool) $total;
    }
}
