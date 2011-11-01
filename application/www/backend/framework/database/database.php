<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';
require_once 'framework/helpers/configuration.php';
require_once 'framework/database/resultset.php';

// Exceptions.
class DatabaseException extends ExceptionBase { }

/**
 * A singleton class representing a connection to the database.
 * With this database queries can be executed. 
 */
class Database extends Singleton
{
    /** Unique instance. */
    protected static $instance;
    
    /* PDO resource. */
    private $pdo;

    protected function __construct()
    {
        $configuration = Configuration::getInstance();
        
        // Create a php data object using the settings from the configuration.
        $this->pdo = new PDO($configuration->getString('database-dsn'), 
                             $configuration->getString('database-username'), 
                             $configuration->getString('database-password'));
    }

    public function __destruct()
    {
        if ($this->pdo->inTransaction())
        {
            $this->pdo->rollBack();
        }
    }

    /**
     * Starts a database transaction.
     *
     * After calling this method, all query functions will no longer immediately commit their
     * possible changes to the database. This will instead happen atomically and at once when
     * commit() is called.
     *
     * Nested transactions are currently not allowed. Therefore an exception will be thrown if a
     * transaction is already going on.
     *
     * @throws DatabaseException    If some error occurs or a transaction has already been started.
     *
     */
    public function startTransaction()
    {
        if (!$this->pdo->beginTransaction())
        {
            throw new DatabaseException('transaction-start');
        }
    }

    /**
     * Checks wheter currently in a transaction.
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
        if (!$this->pdo->commit())
        {
            throw new DatabaseException('transaction-commit');
        }
    }

    /**
     * Rolls back a transaction.
     *
     * Undoes all queries made in the current transaction. The transaction will have ended, so \
     * startTransaction() should be called again when trying again.
     *
     * @throws DatabaseException  If no transaction has started, rollback is not supported or it failed
     *                            for some other reason.
     */
    public function rollBack()
    {
        if (!$this->pdo->rollBack())
        {
            throw new DatabaseException('transaction-rollback');
        }
    }

    /**
     * Builds a formatted query, but does not execute it.
     * 
     * Builds a query to be executed through query() and execute().The first argument should be a 
     * UTF8-encoded 'format string' containing the query, with every variable SQL value (see below)
     * replaced by a 'conversion specifier', which consists of a %-sign followed by a single 
     * character. For each conversion specifier, an argument should be added to the array in the 
     * second argument. that will be validated, properly escaped and/or quoted and converted to a
     * string of characters in a way indicated by the character after the specifier's %-sign. This 
     * is somewhat similar to how functions like printf are used.
     *
     * IMPORTANT NOTE: Never make the format string depend on user input, preferably do not use
     * strings stored in variables at all. Instead, use conversion specifiers for each SQL value
     * (like integers, strings etc.) of the query that is not conatant and depends on a run-time value.
     *
     * The following conversion specifiers can be used:
     *  - s - A SQL string. The argument should contain a UTF-8 formatted string that will be
     *        quoted and escaped in such a matter it cannot be used for SQL injections.
     *  - d - A numeric literal. The argument should be either an integer, floating point number or
     *        string containing a decimal number. Booleans are also allowed, resulting in either
     *        '1' (true) or '0' (false).
     *  - i - Same as %d, except that floating point numbers are not accepted.
     *  - b - A SQL hexadecimal number representing a bytestring (used for BLOB's, for instance).
     *        The argument should be string which will be interpreted as binary data.
     *  - n - A SQL identifier like a column or table name. The argument is a string that has to
     *           conform to <b>^\*|\w[\w\$]*$</b> and will have double quotes (") added
     *           to its begin and end. The argument should not be directly formed from user input.
     *  - t - A point in time. The argument should be formatted as a Unix timestamp: the numer of
     *           seconds (not milliseconds!) since January 1 1970 00:00:00 GMT. This is also the format
     *           returned by time().
     *  - a - A date. The argument should be a Unix timestamp (just like with %t) that lies at the start of 
     *           or somewhere within the desired date.
     *
     * Note that conversion specifiers are case insensitive, so you may also use capital letters.
     * 
     * Some usage examples can be found in the coumentation of query().
     *
     * @param string $query  The format query. 
     * @param array  $args   An indexed array of the arguments in the correct order.
     * 
     * @return string  A string containing the query which can be safely executed through query()
     *                 or execute().
     * 
     * @throws FormatException  If an argument does not conform to the requirements listed above, if
     *                          the number of arguments is too high or low or if an undefined format
     *                          specifier is used.
     */
    public function buildQuery($query, $args)
    {
        // Split the input at the % signs for easier formatting.
        $inp  = explode('%', $query);
        $outp = $inp[0];
        $arg  = 0;
        for ($i = 1; $i < count($inp); ++$i)
        {
            // Check for %%.
            if (strlen($inp[$i]) == 0)
            {
                if ($i == count($inp) - 1)
                {
                    throw new FormatException('percent-at-end');
                }
                else
                {
                    $outp .= '%' . $inp[$i + 1];
                    ++$i;
                    continue;
                }
            }

            if ($arg >= count($args))
            {
                throw new FormatException('not-enought-arguments');
            }
            
            $outp .= $this->formatSingle($inp[$i][0], $args[$arg]) . substr($inp[$i], 1);
            ++$arg;
        }

        if ($arg < count($args))
        {
            throw new FormatException('too-many-arguments');
        }

        return $outp;
    }

    /**
     * Executes a formatted query and returns its result.
     *
     * Executes a query. It should either receive the result of buildQuery, a query that has been 
     * determined to be safe and does not include unvalidated user input, or one that contains 
     * format specifiers in the same way as required by buildQuery. In the last case, the result of
     * the arguments to this function will be put in an array and provided to buildQuery.
     *
     * Examples:
     *
     * \verbatim
     * ..->query('SELECT user_name, user_email FROM users WHERE user_id = %i', $uid);
     * ..->query('INSERT INTO ORDERS (ORDER_ID, CUSTOMER_NAME, CUSTOMER_ADDRESS) VALUES (%i, %s, %s)',
     *            $id, $customer->getName(), $customer->getAdress());
     * ..->query('UPDATE THUMBNAILS SET IMAGE_DATA = %b WHERE IMAGE_NAME = %s, CREATE_DATE < %a',
     *            $img->getData(), "vla.jpeg", $vladate);
     * \endverbatim
     * 
     * @param string $fquery A well-formed or format query.
     * @param mixed  $args   Arguments that should be properly filled in in the place of format 
     *                       specifiers in a format query. 
     * 
     * @return ResultSet          The result of the query, if any.
     *
     * @throws FormatException 	   If buildQuery fails.
     *         DatabaseException   If a database error occurs or when there is an error in the query.
     */
    public function query( /* $fquery, $args ... */ )
    {
        $stat = $this->pdo->prepare($this->buildQuery(func_get_arg(0), array_slice(func_get_args(),1)));
        if (!$stat->execute())
        {
            throw new DatabaseException('sql', print_r($stat->errorInfo(), true));
        }
        
        return new ResultSet($stat);
    }

    /**
     * Same as query, but does not return a result set.
     *
     * This function should be used for insertions and updates and such.
     */
    public function execute( /* $fquery, $args ... */ )
    {
        $stat = $this->pdo->prepare($this->buildQuery(func_get_arg(0), array_slice(func_get_args(),1)));
        if (!$stat->execute())
        {
            throw new DatabaseException('sql', print_r($stat->errorInfo(), true));
        }
    }
    
    /**
     * Executes a SQL statement prepared
     * TODO: redundant?
     */
//     public function executePreparedStatement($query, $queryArguments) {
//         $statement = $this->pdo->prepare($query);
        
//         foreach ($queryArguments as $argumentName => $argumentValue)
//         {
//             $statement->bindParam(':'. $argumentName, $argumentValue);
//         }
        
//         $statement->execute();
        
//         echo $query;
    
//         return new ResultSet($statement);
//     }

    
    
    //TODO: Allow specification of operators other than '=' in $where_equal arrays. Perhaps use 
    //      custom classes for this (and $col_val_array arguments) instead of arrays.
    
    /**
     * Builds or executes a selection query.
     *
     * Helper function that formulates or executes a SELECT-query. The columns to be selected and a
     * WHERE-clause may be provided.
     *
     * @param $table       The table from which to select.
     * @param $columns     An array of the columns to be selected from the table. An empty array (the 
     *                     default) means all columns should be selected. (Optional)
     * @param $where_equal An associative array with as keys SQL identifiers also present as keys in
     *                     $columns, and as values strings representing values columns in the 
     *                     selected rows should be equal to; these will be formatted as a SQL 
     *                     string, unless they start with a %. In that case they should be provided
     *                     in the same matter as the second argument of the function insert. 
     *                     (Optional)
     * @param $exec	       A boolean that is true by default. Indicates whether the query should be
     * 	                   executed immediately. If not a query will be returned that can be 
     *                     performed by query().
     *                                 
     * Examples:
     * \verbatim
     * ..->select('user', array('first_name', 'last_name'));
     * ..->select('image', array('img_name', 'img_data'), array('create_date' => '%a' . $date));
     * ..->select('product', array('display_name','cost'), array('product_id' =>   '%d' . $id, 
     *                                                           'availability' => '%d' . 1));
     * \endverbatim
     *
     * @return ResultSet/string  If $exec is true: the contents of the selected columns, as 
     *                           retrieved by the database. Otherwise: a query as a string that can
     *                           be used as an argument to query(). 
     *
     * @throws FormatException    If a table or column name is not a valid SQL identifier
     *         DatabaseException  If a database error occured.
     */
    public function select($table, $columns = array(), $where_equal = array(), $exec = true)
    {
        if (!$columns)
        {
            $columns = array('*');
        }

        $q = 'SELECT ' . $this->formatSingle('n', $columns[0]);
        foreach (array_slice($columns, 1) as $col)
        {
            $q .= ', ' . $this->formatSingle('n', $col);
        }

        $q .= ' FROM ' . $this->formatSingle('n', $table) . ' ';
        $q .= $this->buildWhereClause($where_equal, '=');
        
        if ($exec)
        {
            return $this->query($q);
        }
        else
        {
            return $q;
        }
    }

    /**
     * Performs an insertion into the database.
     *
     * Helper function that formulates or executes an INSERT-statement.
     * 
     * TODO: examples
     *
     * @param string $table            The name of the table in which to insert the values.
     * @param array $col_val_array     An array with strings representing columns as keys and things
     *                                 to be inserted into the associated column as string values.
     *                                 If a value starts with '%' and a single character the rest of
     *                                 the string will be formatted according to same rules as the
     *                                 query function. Values that don't start with a format specifier
     *                                 will be formatted with '%s'.
     * @param array $where_equal       A WHERE-clause to be added to the insert statement. Should be
     *                                 used in the same matter as the $where_equal parameter of 
     *                                 select. If this array is empty, the function is a no-op.
     * @param bool  $exec              Indicates whether to automatically execute the query. If 
     *                                 false, the result of this function should be provided to
     *                                 execute() in order to perform the actual insertion.
     *                                 
     * @return string                  The formulated query. Should be manually executed if $exec
     *                                 is false.
     * 
     *
     * @throws FormatException    If a value was formatted incorrectly or an illegal SQL identifier was
     *                            used.
     *         DatabaseException  If a database error occured.
     */
    public function insert($table, $col_val_array, $where_equal, $exec = true)
    {
        if (!$where_equal)
        {
            return;
        }
        
        $query = 'INSERT INTO ' . $this->formatSingle('n', $table) . ' (';
        $vals  = '(';

        foreach ($col_val_array as $col => $val)
        {
            $query .= $this->formatSingle('n', $col) . ',';
            if ($val[0] == '%')
            {
                if (strlen($val) == 1)
                {
                    throw new FormatException('single-percent');
                }
                
                $spec = $val[1];
                $val  = substr($val, 2);
            }
            else
            {
                $spec = 's';
            }
            
            $vals .= $this->formatSingle($spec, $val) . ',';
        }

        $query  = rtrim($query, ',');
        $vals   = rtrim($vals, ',');
        $query .= ') VALUES ' . $vals . ') ';
        
        $query .= $this->buildWhereClause($where_equal, '=');

        if ($exec)
        {
            $this->execute($query);
        }
        
        return $query;
    }
    
    public function update($table, $col_val_array, $where_equal, $exec = true)
    {
        if (!$where_equal)
        {
            return;
        }
        
        $query = 'UPDATE ' . $this->formatSingle('n', $table) . ' SET ';
        foreach ($col_val_array as $col => $val)
        {
            $query .= $this->formatSingle('n', $col) . ' = ';
            if ($val[0] == '%')
            {
                if (strlen($val) == 1)
                {
                    throw new FormatException('single-percent');
                }
                
                $spec = $val[1];
                $val  = substr($val, 2);
            }
            else
            {
                $spec = 's';
            }
            
            $query .= $this->formatSingle($spec, $val) . ',';
        }
        
        $query  = rtrim($query, ',');
        $query .= $this->buildWhereClause($where_equal, '=');
        
        if ($exec)
        {
            $this->execute($query);
        }
        
        return $query;
    }
    
    public function delete($table, $where_equal, $exec = true)
    {
        if (!$where_equal)
        {
            return;
        }
        
        $q  = 'DELETE FROM ' . $this->formatSingle('n', $table) . ' ';
        $q .= $this->buildWhereClause($where_equal, '=');
        
        if ($exec)
        {
            $this->execute($q);
        }
        
        return $q;
    }
    
    // Helper function used by select, insert, update and delete.
    private function buildWhereClause($where_equal_array, $operator)
    {        
        if(count($where_equal_array) == 0)
        {
            return '';
        }
        
        $result = 'WHERE ';
        foreach ($where_equal_array as $col => $val)
        {
            $result .= $this->formatSingle('n', $col). ' ' . $operator . ' ';
                     
            if ($val[0] == '%')
            {
                if (strlen($val) == 1)
                {
                    throw new FormatException('single-percent');
                }
                $spec = $val[1];
                $val  = substr($val, 2);
            }
            else
            {
                $spec = 's';
            }
            
            $result .= $this->formatSingle($spec, $val) . ',';
        } 
        
        $result = rtrim($result, ',');
        
        return $result;
    }

    // Formats a single value according to the rules specified with the query function.
    private function formatSingle($specifier, $arg)
    {
        switch ($specifier)
        {
            case 'i':
                $arg = (int) $arg;

            case 'd':
                if (is_bool($arg))
                {
                    $arg = (int) $arg;
                }
                
                assert(is_numeric($arg));

                // Intentional fall-through.
                
            case 's': 
                $result = $this->pdo->quote($arg);
                if (!$result)
                {
                    throw new DatabaseException('string-quoting');
                }
                
                return $result;

            case 'b':
                // Note: PostgreSQL syntax.
                return "X'" . strtoupper(bin2hex($arg)) . "'";

            case 'n':
                if (!preg_match('/^\*|\w[\w\$]*$/', $arg))
                {
                    throw new FormatException('not-valid-sql-identifier', $arg);
                }
                
                // Note: also Postgre syntax.
                return '"' . $arg . '"';

            case 't':
                assert(is_numeric($arg));
                
                return "(timestamptz 'epoch' + " . $this->pdo->quote($arg) . " * interval '1 second')";

            case 'a':
                return $this->pdo->quote(strftime('%G-%m-%d', $arg));

            default:
                throw new FormatException('not-valid-conversion-specifier', $specifier);
        }
    }
}

// Test
//$dbc = DBConnection::getInstance();
// //$dbc->execute('insert into "DatumTijdTest" ("datum","tijd") values (%a, %t)', time(), time() + 1000);
// $result = $dbc->query('select * from testtabel where testid >= %d',6);
// foreach($result as $row)
// {
//     echo $row->getValue('blah') . "</br>";
// }
// $dbc->update('testtabel', array('testid' => '%i' . 8), array('testid' => '%i' . 7));
