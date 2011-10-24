<?php 

define("DB_TEST_DSN", "pgsql:dbname=test;host=localhost");
define("DB_TEST_USERNAME", "postgres");
define("DB_TEST_PASSWORD", "test");


class FormatException extends Exception
{
    //TODO
}

class DBException extends Exception
{
	//TODO
}

/**
 * An IteratorAggregate for the results of a query.
 * 
 * Can be used to iterate over the rows in the result set of a query. There can only exist one 
 * ResultSet-object at a time. Whenever a new one gets constructed, the old one will be invalidated.
 * 
 * Example:
 * \verbatim
 * $results = $dbc->query('SELECT user_name FROM users WHERE birth_date = %a', unixtojd());
 * foreach($results as $result)
 * {
 *  	print 'Happy birthday, ' . $result->getValue('user_name') . '!\n' 
 * }
 * \endverbatim
 */
class ResultSet implements IteratorAggregate
{
    private $valid;
	public $statement;
	private static $current = NULL;
    
    public function __construct($pdo_stat)
    {
    	self::invalidateCurrent();
    	
    	$this->valid = true;
    	$this->statement = $pdo_stat;
    	self::$current = $this;
    }
    
    public function __destruct()
    {
    	$this->invalidate();
    }
    
    /**
     * Invalidate the ResultSet that is currently in use, if any.
     * 
     * This is automatically called when a new query is executed.
     */
    public static function invalidateCurrent()
    {
    	if(self::$current != NULL)
    	{
    		self::$current->invalidate();
    		self::$current = NULL;
    	}
    }
    
    /**
     * Invalidates the ResultSet.
     * 
     * Doing so will no longer allow you to access any more rows from this result set.
     */
    public function invalidate()
    {
    	if($this->valid)
    	{
    		$this->statement->closeCursor();
    		$this->valid = false;
    	}
    }
    
    public function isValid()
    {
    	return $this->valid;
    }
	
	public function getIterator()
	{
		return new ResultSetIterator($this, $this->statement);
	}
}

/**
 * An iterator of ResultSetRows used by ResultSet.
 * 
 * 
 */
class ResultSetIterator implements Iterator
{
	private $rset;
	private $statement;
	private $i;
	private $curr;
	
	public function __construct($rset, $stat)
	{
		$this->rset = $rset;
		$this->statement = $stat;
		$this->i = -1;
		$this->next();
	}
	
	public function next()
	{
		if(!$this->rset->isValid())
			throw new Exception("Trying to retrieve a row from an invalid ResultSet.");
		++$this->i;
		if($this->i > $this->statement->rowCount())
			throw new Exception("Iterator out of range.");
		
		$this->curr = $this->statement->fetch(PDO::FETCH_ASSOC);
	}
	
	public function key()
	{	
		return $this->i;
	}
	
	public function current()
	{
		if(!$this->rset->isValid())
			throw new Exception("Trying to retrieve a row from an invalid ResultSet.");
		
		return new ResultSetRow($this->curr);
	}
	
	public function valid()
	{
		return $this->i < $this->statement->rowCount();
	}
	
	public function rewind()
	{
		if ($this->i > 0)
			throw new Exception("Operation not supported.");
	}
}

/**
 * Contains the items in a result set from a single row.
 *
 */
class ResultSetRow
{
	private $row;
	
	public function __construct($row)
	{
		foreach($row as $key => $val)
		{
			$this->row[strtoupper($key)] = $val; 
		}
	}
	
	/**
	 * Get the value from the column with the specified name as a string.
	 * 
	 * @param string $columnname The name of the column, is case incensitive.
	 * 
	 * @return A string representing the value stored at the specified column, or NULL if there is 
	 * 		   no column with this name.
	 */
	public function getValue($columnname)
	{
		if(array_key_exists(strtoupper($columnname), $this->row))
			return $this->row[strtoupper($columnname)];
		else
			return NULL;
	}
	
	//TODO: get value as number, date, blob etc.
	
	/**
	 * Returns an associative array with the column names and corresponding alues.
	 * 
	 * Note that the column names are converted to upper case.
	 * 
	 */
	public function getValues()
	{
		return $this->row;
	}
}

class DBConnection
{
    private static $instance;
    private $pdo;
    
    private static function initConnection()
    {
        //echo "Database connection initialized.</br>";
        return new PDO(DB_TEST_DSN, DB_TEST_USERNAME, DB_TEST_PASSWORD);
    }
    
    private function __construct($p)
    {
    	$this->pdo = $p;
    }
    
    public function __destruct() {/*TODO*/}
    
    public static function getConnection()
    {
        if(!self::$instance)
        {
            self::$instance = new DBConnection(DBConnection::initConnection());
        }
        
        return self::$instance;
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
     * @throws DBException	If some error occurs or a transaction has already been started.
     * 
     */
    public function startTransaction()
    {
    	if(!$this->pdo->beginTransaction())
    		throw new DBException("Starting a transaction for an unkown reason.");
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
    	if(!$this->pdo->commit())
    		throw new DBException("Commit failed for an unkown reason.");
    }
    
    /**
     * Rolls back a transaction.
     * 
     * Undoes all queries made in the current transaction. The transaction will have ended, so \
     * startTransaction() should be called again when trying again.
     * 
     * @throws DBException If no transaction has started, rollback is not supported or it failed
     * 					   for some other reason.
     */
    public function rollBack()
    {
    	if(!$this->pdo->rollBack())
    		throw new DBException("Commit rollback failed for an unkown reason.");
    }
    
    //Formats a single value according to the rules specified with the query function.
    private function formatSingle($specifier, $arg)
    {
    	switch($specifier)
    	{
    		case 'i':
    			if(is_float($arg))
    			{
    				throw new FormatException($arg . " is not an integer.");
    			}
    			else if(is_string($arg))
    			{
    				preg_match_all('/[0-9]+/', $arg, $matches);
    				if(count($matches) == 0 || count($matches[0]) == 0 || $matches[0][0] != $arg)
    					throw new FormatException($arg . " is not an integer.");
    			}
    		case 'd':
    			if(is_bool($arg))
    				$arg = $arg ? '1' : '0';
    			else if(!is_numeric($arg))
    				throw new FormatException($arg . "is not a number.");
				else if(is_float($arg)) //TODO: Parse floating point numbers from string argument
				{
					//Note: this is PostgreSQL syntax, other SQL dialects might do this a little different
					if(is_nan($arg))
						$arg = "NaN";
					if(is_infinite($arg))
						$arg = $arg > 0 ? "Infinity" : "-Infinity";
				}
    		case 's': //Intentional fall-through to this point
				$result = $this->pdo->quote($arg);
    			if(!$result)
    				throw new DBException("String quoting is not supported.");
				if(!mb_detect_encoding($result, 'UTF-8'))
					throw new FormatException("String is not encoded as UTF-8");
    			return $result;
    		
    		case 'b':
    			//Note: PostgreSQL syntax
    			if(!is_string($arg))
    				throw new FormatException($arg . " is not a string.");
    			return "X'" . strtoupper(bin2hex($arg)) . "'";
    		case 'n':
    			$matches = array();
    			preg_match_all('/\*|[a-zA-Z_][a-zA-Z_0-9\$]*/', $arg, $matches);
    			if(count($matches) == 0 || count($matches[0]) == 0 || $matches[0][0] != $arg)
    				throw new FormatException($arg . " is not a valid SQL identifier.");
    			return '"' . $arg . '"'; //Note: also Postgre syntax
    		case 't':
    			if(!is_numeric($arg))
    				throw new FormatException("Timestamp is not a number.");
    			return "(timestamptz 'epoch' + {$this->pdo->quote($arg)} * interval '1 second')";
    		case 'a':
    			if(!jdtounix($arg))
    				throw new FormatException('Provided date not within epoch.'); 
    			return $this->pdo->quote(strftime('%G-%m-%d', jdtounix($arg)));
    		default:
    			throw new FormatException('%' . $specifier 
    										  . " is not a valid conversion specifier");
    	}
    }
    
    //Used by query and execute.
    private function buildQuery($arg_arr)
    {
    	if(count($arg_arr) == 0)
    		throw new FormatException("No arguments.");
    	
    	//Split the input at the % signs for easier formatting
    	$inp = explode('%', $arg_arr[0]);
    	$outp = $inp[0];
    	$arg = 1;
    	for($i = 1; $i < count($inp); ++$i)
    	{
    		//Check for %%
    		if(strlen($inp[$i]) == 0)
    		{
    			if($i == count($inp) - 1)
    			throw new FormatException("% at end of format string.");
    			else
    			{
    				$outp .= '%' . $inp[$i + 1];
    				++$i;
    				continue;
    			}
    		}
    			
    		if($arg >= count($arg_arr))
    			throw new FormatException("Not enough arguments.");
    		$outp .= $this->formatSingle($inp[$i][0], $arg_arr[$arg]) . substr($inp[$i],1);
    		++$arg;
    	}
    	
    	if($arg < count($arg_arr))
    		throw new FormatException("Too many arguments.");
    	
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
    * Calling this invalidates any previously created ResultSet.
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
    *  		 conform to <b>\*|[a-zA-Z_][a-zA-Z_0-9\$]*</b> and will have souble quotes (") added
    *  		 to its begin and end. The argument should not be directly formed from user input.
    *  - t - A point in time. The argument should be formatted as a Unix timestamp: the numer of 
    *  		 seconds (not milliseconds!) since January 1 1970 00:00:00 GMT. This is also the format
    *  		 returned by time().
    *  - a - A date. The argument should be an integer representing a Julian day. This is the format
    *  		 returned by unixtojd(). The date should lie somewhere between years 1970 and 2037 
    *  		 (2440588 <= jday <= 2465342). See also http://en.wikipedia.org/wiki/Julian_date 
    *  - % - Simply prints a single %-character, no argument should be supplied along with this.
    *  
    *  Note that conversion specifiers are case insensitive, so you may also use capital letters.
    *
    * Examples:
    *
    * \verbatim
    * query('SELECT user_name, user_email FROM users WHERE user_id = %i', $uid);
    * query('INSERT INTO ORDERS (ORDER_ID, CUSTOMER_NAME, CUSTOMER_ADDRESS) VALUES (%i, %s, %s)',
    * 		$id, $customer->getName(), $customer->getAdress());
    * query('UPDATE THUMBNAILS SET IMAGE_DATA = %b WHERE IMAGE_NAME = %s, CREATE_DATE < %a', 
    * 		$img->getData(), "vla.jpeg", $vladate);
    * \endverbatim
    *
    * @return ResultSet	      The result of the query, if any.
    * 
    * @throws FormatException If an argument does not conform to the requirements listed above, if
    * 						  the number of arguments is too high or low or if an undefined format 
    * 						  specifier is used.
    * 		  DBException 	  If a database error occurs or when there is an error in the query.
    *
    */
    public function query(/*$fquery, $args ...*/)
    {
		ResultSet::invalidateCurrent();
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
    public function execute(/*$fquery, $args ...*/)
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
	 * 				   all columns should be selected.
	 * 
	 * @return ResultSet The contents of the selected columns, as retrieved by the database.
	 *
	 * @throws FormatException If a table or column name is not a valid SQL identifier.
    * 		   DBException 	   If a database error occured.
	 */
	public function select($table, $columns = array())
    {
    	$n = count($columns);
    	if($n == 0)
    	{
    		$columns = array('*');
    	}
    	
    	$q = "SELECT " . $this->formatSingle('n', $columns[0]);
    	foreach(array_slice($columns,1) as $col)
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
     * @param string $table 		The name of the table in which to insert the values.
     * @param array $col_val_array 	An array with strings representing columns as keys and things
     * 								to be inserted into the associated column as string values.
     * 								If a value starts with '%' and a single character the rest of
     * 								the string will be formatted according to same rules as the
     * 								query function. Values that don't start with a format specifier
     * 								will be formatted with '%s'.
     * 
     * @throws FormatException  If a value was formatted incorrectly or an illegal SQL identifier was
     * 							used.
    * 		   DBException 	   	If a database error occured.
     */
    public function insert($table, $col_val_array)
    {
    	$q = 'INSERT INTO ' . $this->formatSingle('n', $table) . ' (';
    	$vals = '(';
    	
    	foreach($col_val_array as $col => $val)
    	{
    		$q .= $this->formatSingle('n', $col) . ',';
    		if($val[0] == '%')
    		{
    			if(strlen($val) == 1)
    				throw new FormatException("Just a single '%' in provided value.");
    			$spec = $val[1];
    			$val = substr($val,2);
    		}
    		else
    		{
    			$spec = 's';
    		}
    		$vals .= $this->formatSingle($spec, $val) . ',';
    	}
    	
    	$q = rtrim($q, ',');
    	$vals = rtrim($vals, ',');
    	$q .= ') VALUES ' . $vals . ')';  	
    	
    	$this->execute($q);
    }
}

//Test
// $dbc = DBConnection::getConnection();
// $result = $dbc->query('select * from testtabel where testid >= %d',6);
// foreach($result as $row)
// {
// 	echo $row->getValue('blah') . "</br>";
// }

