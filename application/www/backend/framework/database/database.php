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
    
    // Query kind: 'SELECT', 'INSERT' or 'UPDATE'.
    private $kind;
    // Either an indexed array of selected columns (select), or an associative array of columns and
    // values (insert, update).
    private $cols;
    // Array of target tables.
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
        
        $tables = array($table);
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
        
        $tables = array($table);
        $this->cols = $vals;
        
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
    
    
    public function prepare($bindings = array())
    {
        //TODO
    }
}