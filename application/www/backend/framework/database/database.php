<?php

require_once 'framework/helpers/singleton.php';
require_once 'framework/database/resultset.php';

// TODO: Read these from ini-file
define("DB_TEST_DSN", "pgsql:dbname=test;host=localhost");
define("DB_TEST_USERNAME", "postgres");
define("DB_TEST_PASSWORD", "test");

class FormatException extends Exception
{
    // TODO
}

class DBException extends Exception
{
    // TODO
}

/**
 * A singleton class representing a connection to the database. With this database queries can be executed. 
 *
 */
class DBConnection extends Singleton
{
    private $pdo;

    private static function initConnection()
    {
        return new PDO(DB_TEST_DSN, DB_TEST_USERNAME, DB_TEST_PASSWORD);
    }

    protected function __construct()
    {
        $this->pdo = self::initConnection();
    }

    public function __destruct()
    {
        // TODO
    }

    /**
     * Get an instance of the database connection. A new connection will be made if it is not yet 
     * present.
     * 
     * @return An instance of the database connection.
     */
    public static function getInstance()
    {
        return parent::getInstance(__CLASS__);
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
     * @throws DBException    If some error occurs or a transaction has already been started.
     *
     */
    public function startTransaction()
    {
        if (!$this->pdo->beginTransaction())
        {
            throw new DBException("Starting a transaction for an unkown reason.");
        }
    }

    /**
     * Checks wheter currently in a transaction.
     *
     * @return A boolean indicating whether currently in a transaction.
     *
     * @throws DBException
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
     * @throws DBException If no transaction has started or the commit failed for some other reason.
     *
     */
    public function commit()
    {
        if (!$this->pdo->commit())
        {
            throw new DBException("Commit failed for an unkown reason.");
        }
    }

    /**
     * Rolls back a transaction.
     *
     * Undoes all queries made in the current transaction. The transaction will have ended, so \
     * startTransaction() should be called again when trying again.
     *
     * @throws DBException If no transaction has started, rollback is not supported or it failed
     *                        for some other reason.
     */
    public function rollBack()
    {
        if (!$this->pdo->rollBack())
        {
            throw new DBException("Commit rollback failed for an unkown reason.");
        }
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
                    $arg = $arg ? '1' : '0';
                }
                    
                assert(is_numeric($arg));

            // Intentional fall-through to this point.
            case 's': 
                $result = $this->pdo->quote($arg);
                if (!$result)
                {
                    throw new DBException("String quoting is not supported.");
                }
                return $result;

            case 'b':
                // Note: PostgreSQL syntax.
                return "X'" . strtoupper(bin2hex($arg)) . "'";

            case 'n':
                $matches = array();
                preg_match_all('/\*|[a-zA-Z_][a-zA-Z_0-9\$]*/', $arg, $matches);
                if (count($matches) == 0 || count($matches[0]) == 0 || $matches[0][0] != $arg)
                {
                    throw new FormatException($arg . " is not a valid SQL identifier.");
                }
                // Note: also Postgre syntax.
                return '"' . $arg . '"';

            case 't':
                assert(is_numeric($arg));
                return "(timestamptz 'epoch' + {$this->pdo->quote($arg)} * interval '1 second')";

            case 'a':
                return $this->pdo->quote(strftime('%G-%m-%d', $arg));

            default:
                throw new FormatException('%' . $specifier . " is not a valid conversion specifier");
        }
    }

    // Used by query and execute.
    private function buildQuery($arg_arr)
    {
        if (count($arg_arr) == 0)
        {
            throw new FormatException("No arguments.");
        }

        // Split the input at the % signs for easier formatting.
        $inp  = explode('%', $arg_arr[0]);
        $outp = $inp[0];
        $arg  = 1;
        for ($i = 1; $i < count($inp); ++$i)
        {
            // Check for %%.
            if (strlen($inp[$i]) == 0)
            {
                if ($i == count($inp) - 1)
                throw new FormatException("% at end of format string.");
                else
                {
                    $outp .= '%' . $inp[$i + 1];
                    ++$i;
                    continue;
                }
            }

            if ($arg >= count($arg_arr))
            {
                throw new FormatException("Not enough arguments.");
            }
            $outp .= $this->formatSingle($inp[$i][0], $arg_arr[$arg]) . substr($inp[$i], 1);
            ++$arg;
        }

        if ($arg < count($arg_arr))
        {
            throw new FormatException("Too many arguments.");
        }

        return $outp;
    }

    /**
     * Executes a formatted query.
     *
     * Executes a query. The first argument should be a UTF8-encoded 'format string' containing the
     * query, with every variable SQL value (see below) replaced by a 'conversion specifier', which
     * consists of a %-sign followed by a single character. For each conversion specifier, an
     * argument should be added that will be validated, properly escaped and/or quoted and
     * converted to a string of characters in a way indicated by the character after the
     * specifier's %-sign. This is somewhat similar to how functions like printf are used.
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
     *           conform to <b>\*|[a-zA-Z_][a-zA-Z_0-9\$]*</b> and will have souble quotes (") added
     *           to its begin and end. The argument should not be directly formed from user input.
     *  - t - A point in time. The argument should be formatted as a Unix timestamp: the numer of
     *           seconds (not milliseconds!) since January 1 1970 00:00:00 GMT. This is also the format
     *           returned by time().
     *  - a - A date. The argument should be a Unix timestamp (just like with %t) that lies at the start of 
     * 	      or somewhere within the desired date.
     *
     *  Note that conversion specifiers are case insensitive, so you may also use capital letters.
     *
     * Examples:
     *
     * \verbatim
     * query('SELECT user_name, user_email FROM users WHERE user_id = %i', $uid);
     * query('INSERT INTO ORDERS (ORDER_ID, CUSTOMER_NAME, CUSTOMER_ADDRESS) VALUES (%i, %s, %s)',
     *         $id, $customer->getName(), $customer->getAdress());
     * query('UPDATE THUMBNAILS SET IMAGE_DATA = %b WHERE IMAGE_NAME = %s, CREATE_DATE < %a',
     *         $img->getData(), "vla.jpeg", $vladate);
     * \endverbatim
     *
     * @return ResultSet          The result of the query, if any.
     *
     * @throws FormatException If an argument does not conform to the requirements listed above, if
     *                           the number of arguments is too high or low or if an undefined format
     *                           specifier is used.
     *           DBException       If a database error occurs or when there is an error in the query.
     *
     */
    public function query( /* $fquery, $args ... */ )
    {
        return new ResultSet($this->pdo->query($this->buildQuery(func_get_args())));
    }

    /**
     * Same as query, but does not return a result set.
     *
     * This function should be used for insertions and updates and such.
     *
     * @return The number of rows affected by the query.
     *
     */
    public function execute( /* $fquery, $args ... */ )
    {
        return $this->pdo->exec($this->buildQuery(func_get_args()));
    }

    /**
     * Execute a selection query.
     *
     * Helper function that formulates and execute a simple SELECT-statement.
     *
     * @param $table   The table from which to select.
     * @param $columns An array of the columns to be selected from the table. An empty array means
     *                    all columns should be selected.
     *
     * @return ResultSet The contents of the selected columns, as retrieved by the database.
     *
     * @throws FormatException If a table or column name is not a valid SQL identifier.
     *            DBException        If a database error occured.
     */
    public function select($table, $columns = array())
    {
        $n = count($columns);
        if ($n == 0)
        {
            $columns = array('*');
        }

        $q = "SELECT " . $this->formatSingle('n', $columns[0]);
        foreach (array_slice($columns, 1) as $col)
        {
            $q .= ', ' . $this->formatSingle('n', $col);
        }

        $q .= " FROM " . $this->formatSingle('n', $table);

        return $this->query($q);
    }

    /**
     * Performs an insertion into the database.
     *
     * Helper function that formulates and executes a simple INSERT-statement.
     *
     * @param string $table         The name of the table in which to insert the values.
     * @param array $col_val_array     An array with strings representing columns as keys and things
     *                                 to be inserted into the associated column as string values.
     *                                 If a value starts with '%' and a single character the rest of
     *                                 the string will be formatted according to same rules as the
     *                                 query function. Values that don't start with a format specifier
     *                                 will be formatted with '%s'.
     *
     * @throws FormatException  If a value was formatted incorrectly or an illegal SQL identifier was
     *                             used.
     *            DBException            If a database error occured.
     */
    public function insert($table, $col_val_array)
    {
        $q    = 'INSERT INTO ' . $this->formatSingle('n', $table) . ' (';
        $vals = '(';

        foreach ($col_val_array as $col => $val)
        {
            $q .= $this->formatSingle('n', $col) . ',';
            if ($val[0] == '%')
            {
                if (strlen($val) == 1)
                {
                    throw new FormatException("Just a single '%' in provided value.");
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

        $q    = rtrim($q, ',');
        $vals = rtrim($vals, ',');
        $q   .= ') VALUES ' . $vals . ')';

        $this->execute($q);
    }
}

// Test
// $dbc = DBConnection::getInstance();
// $result = $dbc->query('select * from testtabel where testid >= %d',6);
// foreach($result as $row)
// {
//     echo $row->getValue('blah') . "</br>";
// }
