<?php 
//[[GPL]]

require_once 'framework/database/database.php';

/**
 * Class containing queries on the libraries table
 */
class PersonSearchList
{
    /**
     * Gets the total amount of users.
     */
    public static function findPersons($conditions, $offset, $limit, $order)
    {
        // Conditionally add includes for the provided search arguments.
        $whereConditions = array();
        $whereValues = array();
        
        // Select clause.
        $query = Query::select("personId")->from('Persons');
        
        // Append condition for name search.
        // TODO: MathijsB probably this shouldnt work like this
        if (isset($conditions['name'])) {
            $whereConditions[] = "name LIKE :name";
            $whereValues['name'] = '%' . $conditions['name'] . '%';
            unset($conditions['name']);
        }
        
        // Add all other conditions.
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