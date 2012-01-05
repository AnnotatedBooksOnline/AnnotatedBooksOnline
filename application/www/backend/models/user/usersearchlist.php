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
    public static function findUsers($conditions, $offset, $limit, $order) 
    {
        $selectColumns = array(
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
        );
        $conditionColumns = array(
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
        );
        
        // Select clause.
        $query = Query::select($selectColumns)->from('Users');
        
        // Conditionally add includes for the provided search arguments.
        $whereConditions = array();
        $whereValues = array();
        
        // Ignore dummy user.
        $dummyId = Setting::getSetting('deleted-user-id');
        if($dummyId !== null)
        {
            $whereConditions[] = 'userId != :dummyId';
            $whereValues['dummyId'] = $dummyId;
        }
        
        foreach ($conditions as $column => $value)
        {
            if($column === 'username' || $column == 'email')
            {
                $whereConditions[] = $column . ' ILIKE :' . $column;
            }
            else
            {
                $whereConditions[] = $column . ' = :' . $column;
            }
            $whereValues[$column] = $value;
        }
        
        $query->where($whereConditions);
        
        if (isset($limit) || isset($offset)) 
        {
            $query->limit($limit, $offset ? $offset : 0);    
        }
        
        if (isset($order)) 
        {
            foreach ($order as $column => $order)
            {
                if (isset($selectColumns[$column]))
                {
                    $query->orderBy($column, $order);
                }
            }
        }
        
        // Parameterize and execute the query and return the resultset.
        return $query->execute($whereValues);
    }
    
    /**
     * Gets the total amount of users.
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