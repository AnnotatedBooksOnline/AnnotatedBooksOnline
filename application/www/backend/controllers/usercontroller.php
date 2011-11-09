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
        - record: {id, ..}, {id, ..}
    
    Create:
        - record: {id, ..}, {id, ..}
    
    Delete:
        - record: {id, ..}, {id, ..}
    
    */
    
    public function actionLoad($data)
    {
        Authentication::assertLoggedOn();
        
        // TODO: Do a security check!
        
        $total = Query::select()->
                 count('userId', 'total')->
                 from('Users')->
                 execute()->
                 getFirstRow()->
                 getValue('total');
        
        $start = $this->getInteger($data, 'start', 0,      true, 0, $total);
        $limit = $this->getInteger($data, 'limit', $total, true, 0, $total);
        
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
        usleep(2 * 1000 * 1000);
        
        return array(
            'records' => array(
                'id' => 1,
                'username' => 'Other username',
                'email' => 'me@email.com',
                'firstname' => 'sdf',
                'lastname' => 'sdf',
                'affiliation' => 'sdf',
                'occupation' => 'sdf',
                'website' => 'http://www.test.nl/'
            )
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
        $website     = self::getString($record, 'website', '', true, 255);
        
        $values = array(
            'username'    => $username,
            'email'       => $email,
            'firstName'   => $firstName,
            'lastName'    => $lastName,
            'password'    => $password,
            'affiliation' => $affiliation,
            'occupation'  => $occupation,
            'website'     => $website,
            'homeAddress' => '',
            'active'      => '1', // TODO: Activation
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
