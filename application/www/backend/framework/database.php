﻿<?php 

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
 * Can be used to iterate over the rows in the result set of a query.
 * 
 * Example:
 * \verbatim
 * $results = $dbc->query('SELECT user_name FROM users WHERE birth_date = %a', unixtojd(time()));
 * foreach($results as $result)
 * {
 *  	print 'Happy birthday, ' . $result->getValue('user_name') . '!\n' 
 * }
 * \endverbatim
 */
class ResultSet implements IteratorAggregate
{
    //TODO
    
	public function getIterator()
	{
		//TODO ...
	}
}

/**
 * Contains the items in a result set from a single row.
 *
 */
class ResultSetRow
{
	//TODO
	
	public function getValue($columnname)
	{
		
	}
	
	public function getValues()
	{
		
	}
}

class DBConnection
{
    private static $instance;
    private $pdo;
    
    private static function initConnection()
    {
        echo "Database connection initialized.</br>";
        //return new PDO("pgsql:dbname=test;host=localhost", "postgres", "test");
		//return new PDO('mysql:host=localhost;dbname=test', "root", "");
		return NULL;
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
    
    private function quoteString($str)
    {
    	//return $this->pdo->quote($str);
    	return "'" . addslashes($str) . "'"; //TODO: For testing (without a database) only!
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
					//Note: PostgreSQL syntax
					if(is_nan($arg))
						$arg = "NaN";
					if(is_infinite($arg))
						$arg = $arg > 0 ? "Infinity" : "-Infinity";
				}
    		case 's': //Intentional fall-through to this point
				$result = $this->quoteString($arg);
    			if(!$result)
    				throw new DBException("String quoting is not supported.");
				if(!mb_detect_encoding($result, 'UTF-8'))
					throw new FormatException("String is not encoded as UTF-8");
    			return $result;
    		
    		case 'b':
    			//Note: this is PostgreSQL syntax, other SQL dialects might do this a little different
    			if(!is_string($arg))
    				throw new FormatException($arg . " is not a string.");
    			return "X'" . strtoupper(bin2hex($arg)) . "'";
    		case 'n':
    			//TODO: Not sure whether this works
    			$matches = array();
    			preg_match_all('/\*|[a-zA-Z_][a-zA-Z_0-9\$]*/', $arg, $matches);
    			if(count($matches) == 0 || count($matches[0]) == 0 || $matches[0][0] != $arg)
    				throw new FormatException($arg . " is not a valid SQL identifier.");
    			return $arg;
    		//TODO: case 't': ...
    		//TODO: case 'a': ...
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
    *  - n - A SQL identifier like a column or table name. The argument is a string that will not
    *  		 be transformed but has to conform to <b>\*|[a-zA-Z_][a-zA-Z_0-9\$]*</b>. Make sure to
    *  		 validate whether this column or table is accessible when its name depends on user
    *  		 input.
    *  - t - A point in time. TODO
    *  - a - A date. TODO
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
		//TODO: execute query and return results
		echo $this->buildQuery(func_get_args()) . "</br>";
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
    	//TODO: execute query
    	echo $this->buildQuery(func_get_args()) . "</br>";
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

$dbc = DBConnection::getConnection();
$dbc->execute('select a from %n where c < %d, d == %s','b', 42, 'abcedfg');
$dbc->insert('blaat', array('id' => '%i15', 'name' => 'blah', 'someblob' => '%bfúsghf'));