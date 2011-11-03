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
        if (isset($data['id']))
        {
            usleep(2 * 1000 * 1000);
            
            return array(
                'records' => array(
                    'id' => 1,
                    'username' => 'Username',
                    'email' => 'me@email.com',
                    'firstname' => 'sdf',
                    'lastname' => 'sdf',
                    'affiliation' => 'sdf',
                    'occupation' => 'sdf',
                    'website' => 'http://www.test.nl/'
                )
            );
        }
        
        $records = array(
            array(
                'id' => 1,
                'username' => 'Username',
                'email' => 'me@email.com',
                'firstname' => 'sdf',
                'lastname' => 'sdf',
                'affiliation' => 'sdf',
                'occupation' => 'sdf',
                'website' => 'http://www.test.nl/'
            ),
            array(
                'id' => 2,
                'username' => 'b',
                'email' => 'us@them.com',
                'firstname' => 'df',
                'lastname' => 'df',
                'affiliation' => 'df',
                'occupation' => 'df',
                'website' => 'https://www.test2.nl'
            ),
            array(
                'id' => 3,
                'username' => 'c',
                'email' => 'us@them.com',
                'firstname' => 'ds',
                'lastname' => 'ds',
                'affiliation' => 'ds',
                'occupation' => 'ds',
                'website' => 'www.test3.nl/'
            ),
            array(
                'id' => 4,
                'username' => 'd',
                'email' => 'us@them.com',
                'firstname' => 'sdf',
                'lastname' => 'sdf',
                'affiliation' => 'sdf',
                'occupation' => 'sdf',
                'website' => 'http://test4.nl'
            ),
            array(
                'id' => 5,
                'username' => 'e',
                'email' => 'us@them.com',
                'firstname' => 'vcbx',
                'lastname' => 'vcbx',
                'affiliation' => 'vcbx',
                'occupation' => 'vcbx',
                'website' => 'https://test5.nl'
            ),
            array(
                'id' => 6,
                'username' => 'f',
                'email' => 'us@them.com',
                'firstname' => 'fs',
                'lastname' => 'fs',
                'affiliation' => 'fs',
                'occupation' => 'fs',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 7,
                'username' => 'g',
                'email' => 'us@them.com',
                'firstname' => 'sdf',
                'lastname' => 'sdf',
                'affiliation' => 'sdf',
                'occupation' => 'sdf',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 8,
                'username' => 'h',
                'email' => 'us@them.com',
                'firstname' => 'ds',
                'lastname' => 'ds',
                'affiliation' => 'ds',
                'occupation' => 'ds',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 9,
                'username' => 'i',
                'email' => 'us@them.com',
                'firstname' => 'xcvbc',
                'lastname' => 'xcvbc',
                'affiliation' => 'xcvbc',
                'occupation' => 'xcvbc',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 10,
                'username' => 'j',
                'email' => 'us@them.com',
                'firstname' => 'xvb',
                'lastname' => 'xvb',
                'affiliation' => 'xvb',
                'occupation' => 'xvb',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 11,
                'username' => 'k',
                'email' => 'us@them.com',
                'firstname' => 'cxvb',
                'lastname' => 'cxvb',
                'affiliation' => 'cxvb',
                'occupation' => 'cxvb',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 12,
                'username' => 'l',
                'email' => 'us@them.com',
                'firstname' => 'cvb',
                'lastname' => 'cvb',
                'affiliation' => 'cvb',
                'occupation' => 'cvb',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 13,
                'username' => 'm',
                'email' => 'us@them.com',
                'firstname' => 'cxvb',
                'lastname' => 'cxvb',
                'affiliation' => 'cxvb',
                'occupation' => 'cxvb',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 14,
                'username' => 'n',
                'email' => 'us@them.com',
                'firstname' => 'vcbx',
                'lastname' => 'vcbx',
                'affiliation' => 'vcbx',
                'occupation' => 'vcbx',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 15,
                'username' => 'o',
                'email' => 'us@them.com',
                'firstname' => 'c',
                'lastname' => 'c',
                'affiliation' => 'c',
                'occupation' => 'c',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 16,
                'username' => 'p',
                'email' => 'us@them.com',
                'firstname' => 'vcvc',
                'lastname' => 'vcvc',
                'affiliation' => 'vcvc',
                'occupation' => 'vcvc',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 17,
                'username' => 'q',
                'email' => 'us@them.com',
                'firstname' => 'cvx',
                'lastname' => 'cvx',
                'affiliation' => 'cvx',
                'occupation' => 'cvx',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 18,
                'username' => 'r',
                'email' => 'us@them.com',
                'firstname' => 'cv',
                'lastname' => 'cv',
                'affiliation' => 'cv',
                'occupation' => 'cv',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 19,
                'username' => 's',
                'email' => 'us@them.com',
                'firstname' => 'xcvbc',
                'lastname' => 'xcvbc',
                'affiliation' => 'xcvbc',
                'occupation' => 'xcvbc',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 20,
                'username' => 't',
                'email' => 'us@them.com',
                'firstname' => 'bv',
                'lastname' => 'bv',
                'affiliation' => 'bv',
                'occupation' => 'bv',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 21,
                'username' => 'u',
                'email' => 'us@them.com',
                'firstname' => 'g',
                'lastname' => 'g',
                'affiliation' => 'g',
                'occupation' => 'g',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 22,
                'username' => 'v',
                'email' => 'us@them.com',
                'firstname' => 'er',
                'lastname' => 'er',
                'affiliation' => 'er',
                'occupation' => 'er',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 23,
                'username' => 'w',
                'email' => 'us@them.com',
                'firstname' => 'ts',
                'lastname' => 'ts',
                'affiliation' => 'ts',
                'occupation' => 'ts',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 24,
                'username' => 'x',
                'email' => 'us@them.com',
                'firstname' => 'dsfg',
                'lastname' => 'dsfg',
                'affiliation' => 'dsfg',
                'occupation' => 'dsfg',
                'website' => 'http://www.uu.nl/'
            ),
            array(
                'id' => 25,
                'username' => 'Langerdanditkannietoftochwelll',
                'email' => 'emailadressenkunnenheellangzijn@maarzijndatnooit.com',
                'firstname' => 'Langerdanditkannietoftochwelllneetochnietbijnaaaa',
                'lastname' => 'Langerdanditkannietoftochwelllneetochnietbijnaaaa',
                'affiliation' => 'Langerdanditkannietoftochwelllneetochnietbijnaaaa',
                'occupation' => 'Langerdanditkannietoftochwelllneetochnietbijnaaaa',
                'website' => 'http://www.uu.nl/'
            )
        );
        
        $start = isset($data['start']) ? abs(intval($data['start'])) : 0;
        $limit = isset($data['limit']) ? abs(intval($data['limit'])) : count($records);
        
        return array(
            'records' => array_slice($records, $start, $limit),
            'total' => count($records)
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
}
