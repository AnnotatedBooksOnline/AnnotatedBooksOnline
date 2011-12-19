<?php
//[[GPL]]

require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'framework/database/resultset.php';
require_once 'framework/database/query.php';

// Exceptions.
class DatabaseException    extends ExceptionBase { }
class QueryFormatException extends ExceptionBase { }

// Database class.
class Database extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /** PDO resource. */
    private $pdo;
    
    /** Transaction level. */
    private $transactionLevel;
    
    protected function __construct()
    {
        $config = Configuration::getInstance();
    
        // Create a php data object using the settings from the configuration.
        $this->pdo = new PDO($config->getString('database-dsn'),
                             $config->getString('database-username'),
                             $config->getString('database-password'),
                             array(PDO::ATTR_PERSISTENT => true));
        
        $this->transactionLevel = 0;
    }
    
    public function __destruct()
    {
        if ($this->pdo->inTransaction())
        {
            $this->pdo->rollBack();
        }
    }

    /**
     * Starts a database transaction. Nested transaction are allowed.
     *
     * @throws DatabaseException  If the transaction could not be started.
     */
    public function startTransaction()
    {
        if ($this->transactionLevel === 0)
        {
            if (!$this->pdo->beginTransaction())
            {
                throw new DatabaseException('transaction-start');
            }
        }
        else
        {
            // Save at this point.
            $this->pdo->exec('SAVEPOINT LEVEL' . $this->transactionLevel);
        }
        
        ++$this->transactionLevel;
    }

    /**
     * Checks whether currently in a transaction.
     *
     * @return A boolean indicating whether currently in a transaction.
     *
     * @throws DatabaseException
     *
     */
    public function inTransaction()
    {
        return $this->pdo->inTransaction();
    }

    /**
     * Commits the current transaction.
     *
     * Commits the current transaction, finalizing all changes made to the database. The transaction
     * will now have ended and startTransaction can be called start a new one (or the query methods
     * can be called directly).
     *
     * @throws DatabaseException  If no transaction has started or the commit failed for some
     *                            other reason.
     *
     */
    public function commit()
    {
        if ($this->transactionLevel === 0)
        {
            throw new DatabaseException('transaction-nothing-to-commit');
        }
        
        --$this->transactionLevel;
        
        if ($this->transactionLevel === 0)
        {
            if (!$this->pdo->commit())
            {
                 throw new DatabaseException('transaction-commit');
            }
        }
        else
        {
            // Release savepoint, we no longer need it.
            $this->pdo->exec('RELEASE SAVEPOINT LEVEL' . $this->transactionLevel);
        }
    }
    
    /**
     * Rolls back a transaction.
     *
     * Undoes all queries made in the current transaction. The transaction will have ended, so \
     * startTransaction() should be called again when trying again.
     *
     * @throws DatabaseException  If no transaction has started, rollback is not supported or it
     *                            failed for some other reason.
     */
    public function rollBack()
    {
        if ($this->transactionLevel === 0)
        {
            throw new DatabaseException('transaction-nothing-to-roll-back');
        }
        
        --$this->transactionLevel;
        
        if ($this->transactionLevel === 0)
        {
            if (!$this->pdo->rollBack())
            {
                throw new DatabaseException('transaction-rollback');
            }
        }
        else
        {
            // Rollback to savepoint.
            $this->pdo->exec('ROLLBACK TO SAVEPOINT LEVEL' . $this->transactionLevel);
        }
    }
    
    /**
     * Exception-safe transaction handler.
     * 
     * Starts a transaction and executes the provided callback. If that callback terminates
     * normally the transaction is committed, if it throws an exception however the transaction
     * will be rolled back and it is rethrown.
     * 
     * @param callback $callback The function to execute as a transaction. May contain calls to
     *                           this method for recursive transactions.
     * 
     * @return mixed Returns whatever value the callback returns, if any.
     * 
     * @throws Exception Rethrows exceptions from the callback.
     */
    public function doTransaction($callback)
    {
        $this->startTransaction();
        
        try
        {
            $returnValue = call_user_func($callback);
            $this->commit();
            
            return $returnValue;
        }
        catch (Exception $e)
        {
            $this->rollBack();
            
            throw $e;
        }
    }
    
    /**
     * Executes query.
     *
     * @param $query      Query to execute.
     * @param $arguments  Arguments to bind to query.
     * @param $types      Types of those arguments.
     *
     * @return  Result set.
     */
    public function execute($query, $arguments = array(), $types = null)
    {
        Log::debug("Executing query:\n%s", $query);
        
        // Prepare statement.
        $statement = $this->pdo->prepare($query);
        
        // Bind parameters.
        foreach ($arguments as $name => $value)
        {
            $type = ($types !== null) ?
                (isset($types[$name]) ? $types[$name] : 'string') : 'string';
            
            $typedValue = self::valueToType($value, $type);
            
            $statement->bindValue(
                $name,
                $typedValue,
                $this->parameterTypeFromType($value, $type)
            );
        }
        
        // Run statement.
        if (!$statement->execute())
        {
            // Get error info.
            $errorInfo = $statement->errorInfo();
            
            throw new DatabaseException('query-failed', $errorInfo[1], $errorInfo[2]);
        }
        
        // Return resultset.
        return new ResultSet($statement);
    }
    
    /**
     * Converts database data to normal data.
     *
     * @param $value  Value to convert.
     * @param $type   Type of the value.
     *
     * @return  Resulting value.
     */
    public static function convertFromType($value, $type)
    {
        return self::valueFromType($value, $type);
    }
    
    /**
     * Converts database data to normal data.
     *
     * @param $values  Values to convert.
     * @param $types   Types of those values.
     *
     * @return  Resulting values.
     */
    public static function convertFromTypes($values, $types)
    {
        foreach ($values as $name => $value)
        {
            $type = ($types !== null) ?
                (isset($types[$name]) ? $types[$name] : 'string') : 'string';
            
            $values[$name] = self::valueFromType($value, $type);
        }
        
        return $values;
    }
    
    /*
     * Helper methods for converting specific kinds of data.
     */
    
    private static function valueFromType($value, $type)
    {
        if ($value === null)
        {
            return null;
        }
        
        switch ($type)
        {
            case 'bool':
            case 'boolean':
                return (bool) $value;
                
            case 'int':
            case 'integer':
                return (int) $value;
                
            case 'lob':
                return $value;
                
            case 'date':
            case 'time':
            case 'timestamp':
                // TODO: Test this.
                return strtotime($value);
                
            case 'string':
            default:
                return (string) $value;
        }
    }
    
    private static function valueToType($value, $type)
    {
        if ($value === null)
        {
            return null;
        }
        
        switch ($type)
        {
            case 'bool':
            case 'boolean':
                return $value ? '1': '0';
                
            case 'int':
            case 'integer':
                return (int) $value;
                
            case 'lob':
                return $value;
                
            case 'date':
                return date('Y-m-d', (int) $value);
                
            case 'time':
                return date('H:i:s', (int) $value);
                
            case 'timestamp':
                return date('Y-m-d H:i:s', (int) $value);
                
            case 'string':
            default:
                return (string) $value;
        }
    }
    
    private static function parameterTypeFromType($value, $type)
    {
        if ($value === null)
        {
            return PDO::PARAM_NULL;
        }
        
        switch ($type)
        {
            case 'int':
            case 'integer':
                return PDO::PARAM_INT;
                
            case 'bool':
            case 'boolean':
                return PDO::PARAM_BOOL;
                
            case 'lob':
                return PDO::PARAM_LOB;
                
            case 'date':
            case 'time':
            case 'timestamp':
            case 'string':
            default:
                return PDO::PARAM_STR;
        }
    }
    
    /**
     * TODO
     */
    public function escape($value)
    {
        return $this->pdo->quote($value);
    }
}
