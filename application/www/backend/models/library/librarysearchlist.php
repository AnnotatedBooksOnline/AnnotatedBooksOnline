<?php 
//[[GPL]]

require_once 'framework/database/database.php';

/**
 * Class containing queries on the libraries table
 */
class LibrarySearchList
{
    /**
     * Gets the total amount of users.
     */
    public static function findLibraries($conditions, $offset, $limit, $order)
    {
        // Select clause.
        $query = Query::select("libraryId")->from('Libraries');
        
        // Conditionally add includes for the provided search arguments.
        $whereConditions = array();
        $whereValues = array();
        foreach ($conditions as $column => $value)
        {
            $whereConditions[] = $column . ' = :' . $column;
            $whereValues[$column] = $value;
        }
        $query->where($whereConditions);
        
        if (isset($limit) || isset($offset)) 
        {
            $query->limit($limit, $offset ? $offset : 0);    
        }
        
        if (isset($order)) 
        {
            $query->orderByMultiple($order);
        }
        
        // Parameterize and execute the query and return the resultset.
        return $query->execute($whereValues);
    }
}