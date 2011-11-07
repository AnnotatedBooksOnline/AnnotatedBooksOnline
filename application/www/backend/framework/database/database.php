<?php
//[[GPL]]

require_once 'framework/helpers/exceptionbase.php';
require_once 'framework/helpers/singleton.php';
require_once 'framework/helpers/configuration.php';

// Exceptions.
class DatabaseException extends ExceptionBase { }

class QueryFormatException extends ExceptionBase { }

class DBConnection extends Singleton
{
    // Unique instance.
    protected static $instance;
    
    // PDO resource.
    private $pdo;
    
    protected function __construct()
    {
        $config = Configuration::getInstance();
    
        // Create a php data object using the settings from the configuration.
        $this->pdo = new PDO($config->getString('database-dsn'),
                             $config->getString('database-username'),
                             $config->getString('database-password'));
    }
    
    /**
     * Returns the underlying PDO-object.
     */
    public function getPDO()
    {
        return $this->pdo;
    }
}

/**
 * Can be used to group multiple predicates together with OR-operators in QueryBuilder::where.
 */
function _or(/* $a0, $a1, ... $an*/)
{
    return '(' . implode(' OR ', func_get_args()) . ')';
}

/**
* Can be used to group multiple predicates together with AND-operators in QueryBuilder::where.
*/
function _and(/* $a0, $a1, ... $an*/)
{
    return '(' . implode(' AND ', func_get_args()) . ')';
}

/**
 * An object of this class represents a query that is being build. Using its functions, the query 
 * can be safely (not vulnerable to injections) expanded. The order in which the functions are used
 * is irrelevant, but an exception is thrown when conflicts arise (e.g. when calling update and 
 * select on the same object without clearing).
 * 
 * When finished, you can call prepare() which prepares the (possible paramterized) query and bakes 
 * a PDOStatement. PDO functions can subsequently be used to execute the query. 
 * 
 * If you want to inspect its result, use either the PDO functions or construct a {@link ResultSet}
 * from the executed statement.   
 * 
 * <b>Definitions:</b>
 * The following definitions will be used in the documentation of this class:
 * 
 *  - SQL identifier: a string representing something like a SQL table or column name. Is allowed
 *                    to start and end with double-quotes ("). The actual identifier should start
 *                    with a letter or underscore and its following characters should be letters,
 *                    underscores, digits or $-signs. With letters characters in range a-z and A-Z
 *                    are meant. SQL supports non-ASCII letters but this definition doesn't.
 *                    Illegal SQL identifiers will be detected when calling prepare() and result in
 *                    an exception.
 *  
 *  - SQL value:      a UTF-8 string or something convertible to that representing a SQL string 
 *                    literal that will be used in the query as a new column value or something a 
 *                    column value can be compared to. These values will be properly escaped, 
 *                    meaning they should be injection-proof and can directy depend on user input
 *                    (assuming there is no bug in the code of the prepare-function). 
 *                    (Strings containing) integer and floating point values can be used to 
 *                    represent numeric SQL values. This might not, however, be possible with some
 *                    other types (like hexadecimal strings representing BLOB's). Use parameter 
 *                    markers for these.
 *  
 *  - Parameter marker: Either a single '?' or a string which first character is a ':', followed by
 *                      some identifier representing a parameter name. You can only use one style 
 *                      per query: either question marks or named parameters. These markers will be
 *                      directly placed inside the incomplete query fed to PDO::prepare and allow
 *                      the database to partially prepare the query, so multiple executions with
 *                      different parameters will occur faster.
 *                      After preparation, variables need to bound to these markers using 
 *                      PDOStatement::execute() or PDOStatement::bindValue().
 *                      For more information: see http://nl.php.net/manual/en/pdo.prepare.php
 *                       
 *
 * <b>Chaining</b>
 * All member function of {@link QueryBuilder}, with the exception of prepare(). Return a reference
 * to the object they were called on (return $this). This allows 'chaining' operations, as can be
 * seen in the examples.
 * 
 * <b>Examples</b>
 * \verbatim
 * 
 * // Simple selection.
 * $qb->select(array('username', 'affiliation'))->from('User')->where(array('userid' => $uid));
 * $stat = $qb->prepare();
 * 
 * // Another selection, with ?-marker.
 * $qb->from('TEIFile')->select()->where(array('createDate' => '<= ?'));
 * 
 * // Building and executing an insertion query with named parameter markers.
 * $stat = $qb->insert('PendingUser', array('pendingUserID'    => ':pid', 
 *                                          'confirmationCode' => ':code',
 *                                          'expirationDate'   => endOfYear()))->prepare();
 * $stat->execute(array(':pid' => $user1, ':code' => generateCode()));
 * $stat->execute(array(':pid' => $user2, ':code' => generateCode()));
 * 
 * // Query which deletes all books from between 1500 and 1512 that are written in either Japanese 
 * // or German.
 * $qb->delete('Book')->where('minYear >= 1500', 'maxYear <= 1512', 
 *                             _or('language LIKE ja%', 'language LIKE de%'));
 * 
 * \endverbatim
 * 
 */
class QueryBuilder
{
    // PDO resource for preparing queries.
    private $pdo;
    
    // Query kind: 'SELECT', 'INSERT', 'UPDATE' or 'DELETE'.
    private $kind;
    // Either an indexed array of selected columns (select), or an associative array of columns and
    // values (insert, update). Not used by delete.
    private $cols;
    // Array of target tables. Should contain one element when not selecting.
    private $tables;
    // String representing the WHERE-clause.
    private $whereclause;
    
    //TODO: join, union etc.
    
    /**
     * Clears all query elements that have been set.
     */
    public function clear()
    {
        $this->kind = NULL;
        $this->cols = array();
        $this->tables = array();
        $this->whereclause = NULL;
        $this->joinclause = array();
        
        return $this;
    }
    
    /**
     * Constructs a new QueryBuilder. Acquires an instance of the DBConnection-singleton, which 
     * will now be initialized if it wasn't before.
     * 
     */
    public function __construct()
    {
        $this->pdo = DBConnection::getInstance()->getPDO();
        
        $this->clear();
    }
    
    // Convenience function.
    private function assert($cond, $error_id)
    {
        if(!$cond)
        {
            throw new QueryFormatException($error_id);
        }
    }     
    
    /**
     * Determines the query should be a SELECT-statement, if not yet the case, and specifies which 
     * columns should be selected. If already called on the same object before, it will extend the 
     * columns to be selected. If a single select with no argument or an empty array has been made,
     * all columns will be selected.
     * 
     * @param array $cols A (possibly empty) array of SQL Identifiers representing columns to limit
     *                    the result of the selection to.
     */
    public function select($cols = array())
    {
        $this->assert($this->kind === NULL || $this->kind == 'SELECT', 'different-kinds');
        $this->kind = 'SELECT';
        
        $this->cols = array_merge($this->cols, $cols);
        
        return $this;
    }
    
    /**
     * When constructing a SELECT-statement, specifies which table(s) to select from.
     * 
     * @param string/array $tables An array of SQL identifiers representing tables to select from. 
     *                             It's also possible to specify a single string, which will be 
     *                             interpreted as an array containing only that.
     */
    public function from($tables)
    {
        $this->assert($this->kind === NULL || $this->kind == 'SELECT', 'different-kinds');
        $this->kind = 'SELECT';
        
        if(is_array($tables))
        {
            $this->tables = array_merge($this->tables, $tables);
        }
        else
        {
            array_push($this->tables, $tables);
        }
        
        return $this;
    }
    
    /**
     * Determines the query should be an INSERT-statement and specifies its parameters. 
     * 
     * @param string $table The name of the table in which to insert.
     * @param array  $vals  An associative array with column names as keys and as values parameter
     *                      marks or SQL values.
     */
    public function insert($table, $vals)
    {
        $this->assert($this->kind === NULL, 'different-kinds');
        $this->kind = 'INSERT';
        
        $this->tables = array($table);
        $this->cols = $vals;
        
        return $this;
    }
    
    /**
     * Determines the query should be an UPDATE-statement and specifies its parameters. Can (and
     * usually should) be followed by a where. 
     * 
     * @param string $table The name of the table in which to update rows.
     * @param array  $vals  An associative array with column names as keys and as values parameter
     *                      marks or SQL values.
     */
    public function update($table, $vals)
    {
        $this->assert($this->kind === NULL, 'different-kinds');
        $this->kind = 'UPDATE';
        
        $this->tables = array($table);
        $this->cols = $vals;
        
        return $this;
    }
    
    /**
     * Determine the query should be a DELETE-statement. Should generally be followed by a where.
     * 
     * @param string $table The table from which to delete.
     */
    public function delete($table)
    {
        $this->assert($this->kind === NULL || $this->kind == 'DELETE', 'different-kinds');
        $this->kind = 'DELETE';
        
        $this->tables = array($table);
        
        return $this;
    }
    
//     /**
//      * Specify the where clause of the query. Its argument is an associative array with as keys
//      * column names and as values a predicate. This predicate can simply be SQL value or parameter
//      * marker, in which case that column will be compared for equality to that value. It can also 
//      * be a SQL operator, followed by a single space, followed by a parameter marker or SQL value 
//      * (see examples). In that case that operator will be used instead of '='. The value behind the
//      * operator will still be escaped, so don't add quotes yourself.
//      * 
//      * The currently supported operators are '<','>','>=','<=', '=','==', 'is','like', '!=', '<>', 
//      * 'not is', 'not like', 'overlaps', 'in' and 'not in'. Operators are case insensitive.
//      * 
//      * Different elements in the where-array are seperated by AND's (same as comma's). The results
//      * of multiple where-calls will also be seperated by AND's.
//      * 
//      * @param array $clause The afformented associative array.
//      */
//     public function where($clause)
//     {
//         foreach($clause as $left => $right)
//         {
//             array_push($this->whereclause, array($left => $right));
//         }
        
//         return $this;
//     }
    
//     public function where_or($clause)
//     {
//         array_push($this->whereclause, $clause);
        
//         return $this;
//     }    

    /**
     * Specify the WHERE-clause of a query. Each argument should be a string containing a SQL 
     * predicate that will be directly placed in the where-statement of the query. Note that its
     * contents will NOT be escaped or validated, so make sure they do not directly depend on user
     * input. Parameter markers should be used instead.
     * 
     * The arguments are sperated by a logical AND's. Use the _or and _and functions to delimit 
     * sub-predicates with respectively OR's or AND's. 
     * 
     * For instance, the predicate (A || B || (C && D)) && E can be formulated as:
     * 
     * \verbatim
     * ..->where(_or(A, B, _and(C, D)), E);
     * \endverbatim
     */
    public function where(/* $arg0, $arg1, ... $argn */)
    {
        if($this->whereclause === NULL)
        {
            $this->whereclause = 'WHERE ';
        }
        
        return implode(', ', func_get_args());
    }
    
    // Checks whether something like a column or table name is a valid SQL identifier. Is used by
    // prepare for a little extra security in case of programming mistakes. An identifier is 
    // is allowed (but not obliged) to start and end with two double-quote (") characters. 
    // Returns its argument.
    private function validateSQLId($id)
    {
        if(!preg_match('/\w[\w\$]*$|"\w[\w\$]*$"/', $id))
        {
            throw new QueryFormatException('invalid-sql-id', $id);
        }
        
        return $id;
    }
    
    //Escapes a SQL value, returns parameter markers unchanged.
    private function escapeValue($val)
    {
        // Explicitly cast to string.
        $val = (string) $val;
        
        //TODO: Forbid ?'s as their order can lead to confusion.
        
        if($val == '?' || (count($val) > 0 && $val[0] == ':'))
        {
            // PDO bindings shouldn't be escaped.
            return $val;
        }
        else
        {
            return $this->pdo->quote($val);
        }
    }
    
    // Returns whether $op is a binary SQL operator returning a boolean to be used in a WHERE 
    // clause. See documentation where(..).
    private function isWhereOperator($op)
    {
        $ops = array('<','>','>=','<=',
                     '=','==', 'is','like',
                     '!=', '<>', 'not is', 'not like',
                     'overlaps', 'in', 'not in');
        
        return in_array(strtolower(trim($op)), $ops);
    }
    
    /**
     * Finalizes the query and prepares it (see class documentation). It does not clear the query 
     * afterwards.
     * 
     * @return PDOStatement The prepared PDO statement that is not yet executed. If parameter 
     *                      markers were used when constructing the query, corresponding parameters
     *                      need to be bound first.
     * 
     * @throws QueryFormatException When an invalid identifier was used during the construction of
     *                              the query.
     */
    public function prepare()
    {       
        $this->assert(count($this->tables) > 0, 'query-incomplete');
        
        // Build query base depending on kind.
        switch($this->kind)
        {
            case 'SELECT':
                $q = 'SELECT ';
                foreach($this->cols as $col)
                {
                    $q .= $this->validateSQLId($col) . ',';
                }
                
                $q  = rtrim($q, ',') . ' FROM ';
                foreach ($this->tables as $table)
                {
                    $q .= $this->validateSQLId($table) . ',';
                }
                
                $q  = rtrim($q, ',');
                break;
            case 'DELETE':
                $q = 'DELETE ' . $this->validateSQLId($this->tables[0]);
                break;
            case 'INSERT':
                $q = 'INSERT INTO ' . $this->validateSQLId($this->tables[0]);
                $cols = '(';
                $vals  = '(';
                
                foreach ($this->cols as $col => $val)
                {
                    $cols .= $this->validateSQLId($col) . ',';
                    $vals .= $this->escapeValue($val) . ',';
                }
                
                $cols = rtrim($cols, ',') . ')';
                $vals = rtrim($vals, ',') . ')';
                
                $q .= ' ' . $cols . ' VALUES ' . $vals;
                break;
            case 'UPDATE':
                $q = 'UPDATE ' . $this->validateSQLId($this->tables[0]) . ' SET (';
                
                foreach ($this->cols as $col => $val)
                {
                    $this->validateSQLId($col) . ' = ' . $this->escapeValue($val) . ',';
                }
                
                $q = rtrim($q, ',') . ')';
                break;
            default:
                throw new QueryFormatException('query-incomplete');
        }
        
//         //Where clause.
//         if(count($this->whereclause) > 0)
//         {
//             $q .= ' WHERE (';
            
//             //TODO: Do this with lambda function, implode and map.
//             foreach($this->whereclause as $outer)
//             {
//                 foreach($outer as $col => $opval)
//                 {
//                     // If present, extract operator from opval.
//                     $opval = trim($opval);
//                     $lastspace = strrpos($opval, ' ');
//                     if($lastspace)
//                     {
//                         $op = substr($opval, 0, $lastspace);
//                         $val = substr($opval, $lastspace + 1);
//                         if(!$this->isWhereOperator($op))
//                         {
//                             throw new QueryFormatException('invalid-where-operator', $op);
//                         }
//                     }
//                     else
//                     {
//                         $op = '=';
//                         $val = $opval;
//                     }
                    
//                     $q .= $this->validateSQLId($col) . ' ' . $op . ' ' . $this->escapeValue($val) . ' OR ';
//                 }
//                 if(count($outer) > 0)
//                 {
//                     // Strap off last ' OR '. 
//                     $q = substr(0, count($q) - 4);
//                 }
                
//                 $q .= ') AND (';
//             }
            
//             // Strap off last ' AND ('.
//             $q = substr(0, count($q) - 6);
//         }
        
        //Where clause
        if($this->whereclause !== NULL)
        {
            $q .= $this->whereclause;
        }
        
        return $this->pdo->prepare($q);
    }
}

