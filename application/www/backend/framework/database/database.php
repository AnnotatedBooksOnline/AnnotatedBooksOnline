<?php
//[[GPL]]

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
 * TODO
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
    // Array of arrays of where clause elements. Inner arrays represent elements seperated by OR's,
    // while outer arrays will be seperated by AND's.
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
        $this->whereclause = array();
        $this->joinclause = array();
        
        return $this;
    }
    
    /**
     * Constructs a new QueryBuilder.
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
     * @param array $cols An array of strings representing column names. They should be valid SQL
     *                    identifiers.
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
     * @param string/array $tables An array of strings representing tables to select from. Each
     *                             should be a valid SQL identifier. It's also possible to specify
     *                             a string, which will be interpreted as an array containing only
     *                             that string.
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
     * Determines the query should be an INSERT-statement and specifies its parameters. TODO ... 
     * 
     * @param string $table To name of the table in which to insert.
     * @param array  $vals  An associative array with column name => value.
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
     * TODO ...
     */
    public function update($table, $vals)
    {
        $this->assert($this->kind === NULL, 'different-kinds');
        $this->kind = 'UPDATE';
        
        $this->tables = array($table);
        $this->cols = $vals;
        
        return $this;
    }
    
    public function delete($table)
    {
        $this->assert($this->kind === NULL || $this->kind == 'DELETE', 'different-kinds');
        $this->kind = 'DELETE';
        
        $this->tables = array($table);
        
        return $this;
    }
    
    /**
     * TODO ...
     */
    public function where($clause)
    {
        foreach($clause as $left => $right)
        {
            array_push($this->whereclause, array($left => $right));
        }
        
        return $this;
    }
    
    public function where_or($clause)
    {
        array_push($this->whereclause, $clause);
        
        return $this;
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
    
    
    private function escapeValue($val)
    {
        // Explicitly cast to string.
        $val = (string) $val;
        
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
        
        // Where clause.
        if(count($this->whereclause) > 0)
        {
            $q .= ' WHERE (';
            
            //TODO: Do this with lambda function, implode and map.
            foreach($this->whereclause as $outer)
            {
                foreach($outer as $col => $opval)
                {
                    // If present, extract operator from opval.
                    $opval = trim($opval);
                    $lastspace = strrpos($opval, ' ');
                    if($lastspace)
                    {
                        $op = substr($opval, 0, $lastspace);
                        $val = substr($opval, $lastspace + 1);
                        if(!$this->isWhereOperator($op))
                        {
                            throw new QueryFormatException('invalid-where-operator', $op);
                        }
                    }
                    else
                    {
                        $op = '=';
                        $val = $opval;
                    }
                    
                    $q .= $this->validateSQLId($col) . ' ' . $op . ' ' . $this->escapeValue($val) . ' OR ';
                }
                if(count($outer) > 0)
                {
                    // Strap off last ' OR '. 
                    $q = substr(0, count($q) - 4);
                }
                
                $q .= ') AND (';
            }
            
            // Strap off last ' AND ('.
            $q = substr(0, count($q) - 6);
        }
        
        return $this->pdo->prepare($q);
    }
}