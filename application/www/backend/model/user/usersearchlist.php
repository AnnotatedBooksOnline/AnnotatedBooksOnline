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
    public static function findUsers($username) 
    {
        // Select clause.
        $query = Query::select('userId')->from('Users');
        
        // Conditionally add includes for the provided search arguments.
        if ($username) 
        {
            $query = $query->where('username = :username');
        }
            
        // Parameterize and execute the query and return the resultset.
        return $query->execute(array('username' => $username));
    }    
}