<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

require_once 'framework/util/singleton.php';
require_once 'framework/util/configuration.php';
require_once 'framework/database/resultset.php';
require_once 'framework/database/query.php';
require_once 'framework/util/log.php';

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
    
    /** Prepared statements. */
    private $preparedStatements;
    
    protected function __construct()
    {
        $config = Configuration::getInstance();
    
        // Create a php data object using the settings from the configuration.
        $this->pdo = new PDO($config->getString('database-dsn'),
                             $config->getString('database-username'),
                             $config->getString('database-password'),
                             array(
                                 PDO::ATTR_PERSISTENT => true,
                                 PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8' COLLATE 'utf8_unicode_ci', sql_mode = 'ANSI_QUOTES', SESSION group_concat_max_len = 4294967295;",
                                 PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true
                             ));
        
        $this->transactionLevel = 0;
        
        $this->preparedStatements = array();
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
        Log::debug("Arguments:\n%s", print_r($arguments, true));
        
        // Avoid preparing the same statement twice.
        if (isset($this->preparedStatements[$query]))
        {
            // Re-use statement.
            $statement = $this->preparedStatements[$query];
            $statement->closeCursor();
        }
        else
        {
            // Prepare statement.
            $statement = $this->pdo->prepare($query);
            $this->preparedStatements[$query] = $statement;
        }
        
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
    
    public static function valueFromType($value, $type)
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
                return stream_get_contents($value);
            
            case 'base64':
                return base64_decode($value);
            case 'serialized':
                return unserialize($value);
                
            case 'date':
            case 'time':
            case 'timestamp':
                return strtotime($value);
                
            case 'string':
            case 'istring':
            default:
                return (string) $value;
        }
    }
    
    public static function valueToType($value, $type)
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
                
            case 'base64':
                return base64_encode($value);
            case 'serialized':
                return serialize($value);
                
            case 'date':
                return date('Y-m-d', (int) $value);
                
            case 'time':
                return date('H:i:s', (int) $value);
                
            case 'timestamp':
                return date('Y-m-d H:i:s', (int) $value);
                
            case 'string':
            case 'istring':
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
                
            case 'base64':
            case 'serialized':
            case 'date':
            case 'time':
            case 'timestamp':
            case 'string':
            case 'istring':
            default:
                return PDO::PARAM_STR;
        }
    }
    
    public function escape($value)
    {
        return $this->pdo->quote($value);
    }
}

