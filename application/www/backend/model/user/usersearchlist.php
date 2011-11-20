<?php 
//[[GPL]]

require_once 'framework/database/database.php';


/**
* Class containing queries on the user table
*/
class UserSearchList
{
    /**
     * Find users
     * @param $username Username of the users to return
     */
    public static function findUsers($arguments, $offset, $limit, $order) 
    {
        // Select clause.
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
            'rank')->from('Users');
        
        // Conditionally add includes for the provided search arguments.
        if (isset($arguments['userId']))
        {
            $query = $query->where('userId = :userId');
        }
        if (isset($arguments['username']))
        {
            $query = $query->where('username = :username');
        }
        if (isset($arguments['email']))
        {
            $query = $query->where('email = :email');
        }
        if (isset($arguments['firstName']))
        {
            $query = $query->where('firstName = :firstName');
        }
        if (isset($arguments['lastName']))
        {
            $query = $query->where('lastName = :lastName');
        }
        if (isset($arguments['affiliation']))
        {
            $query = $query->where('affiliation = :affiliation');
        }
        if (isset($arguments['occupation']))
        {
            $query = $query->where('occupation = :occupation');
        }
        if (isset($arguments['website']))
        {
            $query = $query->where('website = :website');
        }
        if (isset($arguments['homeAddress']))
        {
            $query = $query->where('homeAddress = :homeAddress');
        }
        if (isset($arguments['rank']))
        {
            $query = $query->where('rank = :rank');
        }
        
        if (isset($limit) || isset($offset)) 
        {
            $query = $query->limit($limit, $offset ? $offset : 0);    
        }
        
        if (isset($order)) 
        {
            foreach ($order as $column => $order)
            {
                if ($column == "userId"
                	|| $column == "username"
                	|| $column == "firstName"
                	|| $column == "lastName"
                	|| $column == "affliation"
                	|| $column == "occupation"
                	|| $column == "website"
                	|| $column == "homeAddress"
                	|| $column == "rank")
                {
                    $query = $query->orderBy($column, $order);
                }
            }
        }
            
        // Parameterize and execute the query and return the resultset.
        return $query->execute($arguments);
    }  
      
    /**
     * 
     * Enter description here ...
     * @param unknown_type $username
     */
    public static function findUserCount()
    {
        return Query::select()->
            count('userId', 'total')->
            from('Users')->
            execute()->
            getFirstRow()->
            getValue('total');
    }
}