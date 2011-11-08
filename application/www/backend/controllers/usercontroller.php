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
    
    Save:
        - records: [ {id, ..}, {id, ..} ]
    
    Create:
        - records: [ {id, ..}, {id, ..} ]
    
    Delete:
        - records: [ {id, ..}, {id, ..} ]
    
    */
    
    public function actionLoad($data)
    {
        $total = Query::select('userId')->from('Users')->execute()->getAmount();
        $start = isset($data['start']) ? abs(intval($data['start'])) : 0;
        $limit = isset($data['limit']) ? abs(intval($data['limit'])) : $total;
        
        $result = Query::select(
            "userId",
            "username",
            "email",
            "firstName",
            "lastName",
            "affiliation",
            "occupation",
            "website"
        )
        ->from('Users')
        ->limit($limit, $start)
        ->execute()
        ->getIterator();
        
        $records = array();
        foreach($result as $user)
        {
            array_push($records, $user->getValues());
        }
        
        return array(
            'records' => $records,
            'total' => $total
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
        $record = self::getArray($data, 'records');
        
        // TODO: weird enough, records is just one record.
        
        $username    = self::getString($record, 'username');
        $email       = self::getString($record, 'email');
        $firstName   = self::getString($record, 'firstName');
        $lastName    = self::getString($record, 'lastName');
        $password    = self::getString($record, 'password');
        $affiliation = self::getString($record, 'affiliation');
        $occupation  = self::getString($record, 'occupation');
        $website     = self::getString($record, 'website');
        
        $values = array(
            'username'    => $username,
            'email'       => $email,
            'firstName'   => $firstName,
            'lastName'    => $lastName,
            'password'    => $password,
            'affiliation' => $affiliation,
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
    }
}
