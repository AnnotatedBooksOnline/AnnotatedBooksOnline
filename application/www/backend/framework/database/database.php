<?php
//[[GPL]]

require_once 'framework/helpers/singleton.php';
require_once 'framework/helpers/configuration.php';
require_once 'framework/database/resultset.php';

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
    
    protected function __construct()
    {
        $config = Configuration::getInstance();
    
        // Create a php data object using the settings from the configuration.
        $this->pdo = new PDO($config->getString('database-dsn'),
                             $config->getString('database-username'),
                             $config->getString('database-password'));
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
     * @throws DatabaseException  If some error occurs or a transaction has already been started.
     *
     */
    public function startTransaction()
    {
        // TODO: stack transactions by keeping a counter.
        
        if (!$this->pdo->beginTransaction())
        {
            throw new DatabaseException('transaction-start');
        }
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
     * Executes query.
     */
    public function execute($query, $arguments = array())
    {
        Log::debug("Executing query:\n%s", $query);
        
        $statement = $this->pdo->prepare($query);
        if (!$statement->execute($arguments))
        {
            // Get error info.
            $errorInfo = $statement->errorInfo();
            
            throw new DatabaseException('query-failed', $errorInfo[1], $errorInfo[2]);
        }
        
        return new ResultSet($statement);
    }
}

/**
 * An object of this class represents a query that is being build. Using its functions, the query 
 * can be safely (not vulnerable to injections) expanded. The order in which the functions are used
 * is irrelevant, but an exception is thrown when conflicts arise (e.g. when calling update and 
 * select on the same object without clearing).
 * 
 * When finished, you can call execute() which executes the query. This method construct a
 * {@link ResultSet} and returns it.  
 * 
 * <b>Definitions:</b>
 * The following definitions will be used in the documentation of this class:
 * 
 *  - SQL identifier: a string representing something like a SQL table or column name. It should 
 *                    start with a letter or underscore and its following characters should be 
 *                    letters, underscores, digits or $-signs. With letters characters in range 
 *                    a-z and A-Z are meant. SQL supports non-ASCII letters but this definition 
 *                    doesn't.
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
class Query
{
    /** Query kind: 'SELECT', 'INSERT', 'UPDATE' or 'DELETE'. */
    private $kind;
    
    /**
     * Either an indexed array of selected columns (select), or an associative array of columns and
     * values (insert, update). Not used by delete.
     */
    private $columns;
    
    /** Array of target tables. Should contain one element when not selecting. */
    private $tables;
    
    /** String representing the join clause. */
    private $joinClause;
    
    /** String representing the where clause. */
    private $whereClause;
    
    /** String representing the having clause. */
    private $havingClause;
    
    /** String representing the group by clause. */
    private $groupByClause;
    
    /** String representing the order by clause. */
    private $orderByClause;
    
    /** String representing the limit and offset clauses. */
    private $limitClause;
    
    /**
     * Constructs a new query. Acquires an instance of the the database, which 
     * will now be initialized if it wasn't before.
     */
    private function __construct($kind)
    {
        $this->clear();
        
        $this->kind = $kind;
    }
    
    
    
    
    
    /*
    
    
    EXAMPLES:
    
    
    Complex example:
    
        $query = Query::select('u.userId')->
                 from('Users u')->
                 count('id', 'grantTotal')->
                 aggregate('MAX', 'maximum')->
                 where('username = :username', 'passwordHash = :hash')->
                 whereOr('username = :username', 'passwordHash = :hash')->
                 join('OtherTable o', array('o.id = u.id', 'o.name = u.name'), 'LEFT')->
                 limit(0, 1)->
                 orderBy('u.username', 'desc')->
                 groupBy('u.name');
        
        $rowSet = $query->execute(array(':username' => $username, ':hash' => self::secureHash($password)));
    
    
    Simple example:
    
        Query::delete('Users')->where('userId = :id')->execute(array('id' => $userId);
    
    
    See also the User model.
    
    */
    
    
    
    
    
    
    
    /*
     * Helper methods.
     */
    
    /**
     * Clears all query elements that have been set.
     */
    public function clear()
    {
        $this->columns       = array();
        $this->tables        = array();
        $this->joinClause    = '';
        $this->whereClause   = '';
        $this->havingClause  = '';
        $this->groupByClause = '';
        $this->orderByClause = '';
        $this->limitClause   = '';
        
        return $this;
    }
    
    /*
     * Query kinds.
     */
    
    /**
     * Determines the query should be a SELECT-statement, if not yet the case, and specifies which 
     * columns should be selected. If already called on the same object before, it will extend the 
     * columns to be selected. If a single select with no argument or an empty array has been made,
     * all columns will be selected.
     * 
     * @param array $columns A (possibly empty) array of SQL Identifiers representing columns to limit
     *                    the result of the selection to.
     */
    public static function select( /* $arg0, $arg1, ... $argn */ )
    {
        $query = new Query('SELECT');
        
        $columns = self::argsToArray(func_get_args());
        
        $query->columns = array_map(array($query, 'escapeIdentifier'), $columns);
        
        return $query;
    }
    
    /**
     * Determines the query should be an INSERT-statement and specifies its parameters. 
     * 
     * @param string $table The name of the table in which to insert.
     * @param array  $vals  An associative array with column names as keys and as values parameter
     *                      marks or SQL values.
     */
    public static function insert($table, $values)
    {
        $query = new Query('INSERT');
        
        $query->tables  = array($query->escapeIdentifier($table));
        
        $query->columns = array();
        foreach ($values as $column => $value)
        {
            $query->columns[$query->escapeIdentifier($column)] = $query->escapeValue($value);
        }
        
        return $query;
    }
    
    /**
     * Determines the query should be an UPDATE-statement and specifies its parameters. Can (and
     * usually should) be followed by a where. 
     * 
     * @param string $table The name of the table in which to update rows.
     * @param array  $vals  An associative array with column names as keys and as values parameter
     *                      marks or SQL values.
     */
    public static function update($table, $values)
    {
        $query = new Query('UPDATE');
        
        $query->tables  = array($query->escapeIdentifier($table));
        
        $query->columns = array();
        foreach ($values as $column => $value)
        {
            $query->columns[$query->escapeIdentifier($column)] = $query->escapeValue($value);
        }
        
        return $query;
    }
    
    /**
     * Determine the query should be a DELETE-statement. Should generally be followed by a where.
     * 
     * @param string $table The table from which to delete.
     */
    public static function delete($table)
    {
        $query = new Query('DELETE');
        
        $query->tables = array($query->escapeIdentifier($table));
        
        return $query;
    }
    
    /*
     * Columns.
     */
    
    public function columns( /* $arg0, $arg1, ... $argn */ )
    {
        $columns = self::argsToArray(func_get_args());
        if (!$columns)
        {
            $columns = array('*');
        }
        
        $query->kind    = 'SELECT';
        $query->columns = array_merge($query->columns,
            array_map(array($query, 'escapeIdentifier'), $columns));
        
        return $this;
    }
    
    public function count($column = '*', $as = 'total')
    {
        $this->columns[] = $this->handleAggregate('COUNT', $column, $as);
        
        return $this;
    }
    
    public function aggregate($function, $as = 'aggregate', $column = '*')
    {
        $this->columns[] = $this->handleAggregate($function, $column, $as);
        
        return $this;
    }
    
    /*
     * Tables.
     */
    
    /**
     * When constructing a SELECT-statement, specifies which table(s) to select from.
     * 
     * @param string/array $tables An array of SQL identifiers representing tables to select from. 
     *                             It's also possible to specify a single string, which will be 
     *                             interpreted as an array containing only that.
     */
    public function from( /* $arg0, $arg1, ... $argn */ )
    {
        $this->assert($this->kind == 'SELECT', 'different-kinds');
        
        $tables = self::argsToArray(func_get_args());
        if (!$tables)
        {
            throw new QueryFormatException('query-incomplete');
        }
        
        $this->tables = array_merge($this->tables,
            array_map(array($this, 'escapeIdentifier'), $tables));
        
        return $this;
    }
    
    public function join($table, $conditions = '', $type = '')
	{
		// Check type.
        $type = strtoupper($type);
        if (!in_array($type, array('LEFT', 'RIGHT', 'OUTER', 'INNER', 'LEFT OUTER', 'RIGHT OUTER')))
        {
            $type = '';
        }
        else
        {
            $type .= ' ';
        }
        
        // Add join
        $this->joinClause .= "\n" . $type . 'JOIN ' . $this->escapeIdentifier($table);
        
        // Add conditions.
        if ($conditions)
        {
            $this->joinClause .= "\nON " . $this->handleConditions($conditions);
        }
        
		return $this;
	}
    
    /*
     * Conditions.
     */
    
    /**
     * Specify the a condition of a query. Each argument should be a string containing a
     * predicate that will be directly placed in the where-statement of the query. Note that its
     * contents will NOT be escaped or validated, so make sure they do not directly depend on user
     * input. Parameter markers should be used instead.
     * 
     * The currently supported operators are '<','>','>=','<=', '=','==', 'is','like', '!=', '<>', 
     * 'not is', 'not like', 'overlaps', 'in' and 'not in'. Operators are case insensitive.
     * 
     * The arguments are separated by a logical AND's. Use whereOr to separate them with OR's.
     */
    public function where( /* $arg0, $arg1, ... $argn */ )
    {
        $this->handleWhere(func_get_args(), true);
        
        return $this;
    }
    
    public function whereOr( /* $arg0, $arg1, ... $argn */ )
    {
        $this->handleWhere(func_get_args(), false);
        
        return $this;
    }
    
    public function having( /* $arg0, $arg1, ... $argn */ )
    {
        $this->handleHaving(func_get_args(), true);
        
        return $this;
    }
    
    public function havingOr( /* $arg0, $arg1, ... $argn */ )
    {
        $this->handleHaving(func_get_args(), false);
        
        return $this;
    }
    
    /*
     * Ordering.
     */
    
    public function limit($value, $offset = 0)
	{
        $value  = max(intval($value),  0);
        $offset = max(intval($offset), 0);
        
		$this->limitClause = "\nLIMIT " . $value . ($offset ? "\nOFFSET " . $offset : '');

		return $this;
	}
    
    public function groupBy()
	{
        // Get columns.
        $columns = self::argsToArray(func_get_args());
        $columns = implode(', ', array_map(array($this, 'escapeIdentifier'), $columns));
        
        // Add group by clause.
        $this->groupByClause .= "\nGROUP BY " . $columns;
        
		return $this;
	}
    
    public function orderBy($column, $direction = 'asc')
	{
		// Check type.
        $direction = (strtolower($direction) != 'desc') ? 'ASC' : 'DESC';
        
        // Add order by clause.
        $this->orderByClause .= "\nORDER BY " . $this->escapeIdentifier($column) . ' ' . $direction;
        
		return $this;
	}
    
    /*
     * Execution.
     */
    
    public function execute()
    {
        $arguments = $this->argsToArray(func_get_args());
        
        return Database::getInstance()->execute($this->build(), $arguments);
    }
    
    /*
     * Private members.
     */
    
    /**
     * Builds the query. It does not clear the query 
     * afterwards.
     * 
     * @return  The full SQL query.
     * 
     * @throws  QueryFormatException  When an invalid identifier was used during the construction of
     *                                the query.
     */
    private function build()
    {
        // Build query base depending on kind.
        switch ($this->kind)
        {
            case 'SELECT':
                $columns = $this->columns ? $this->columns : array('*');
                
                $query = 'SELECT ';
                $query .= implode(', ', $columns);
                $query .= "\nFROM ";
                $query .= implode(', ', $this->tables);
                
                break;
                
            case 'DELETE':
                $query = 'DELETE FROM ' . $this->tables[0];
                break;
                
            case 'INSERT':
                $query = 'INSERT INTO ' . $this->tables[0];
                
                $columns = array_keys($this->columns);
                $values  = array_values($this->columns);
                
                $query .= '(' . implode(', ', $columns) . ")\nVALUES (" . implode(', ', $values) . ')';
                break;
                
            case 'UPDATE':
                $query = 'UPDATE ' . $this->tables[0];
                
                $columns = array();
                foreach ($this->columns as $column => $value)
                {
                    $columns[] = $column . ' = ' . $value;
                }
                
                $query .= "\sSET " . implode(', ', $columns);
                break;
                
            default:
                throw new QueryFormatException('query-incomplete');
        }
        
        // Add clauses.
        $query .= $this->joinClause;
        $query .= $this->whereClause;
        $query .= $this->havingClause;
        $query .= $this->groupByClause;
        $query .= $this->orderByClause;
        $query .= $this->limitClause;
        
        return $query;
    }
    
    private function handleAggregate($function, $column, $as)
    {
        return strtoupper($function) . '(' . $this->escapeIdentifier($column) . ') AS ' .
            $this->escapeIdentifier($as);
    }
    
    private function handleHaving($conditions, $joinWithAnd = true)
    {
        // Get conditions.
        $conditions = $this->handleConditions($conditions, $joinWithAnd);
        
        // Add clauses to having clause.
        if ($this->havingClause)
        {
            $this->havingClause .= "\nAND " . $conditions;
        }
        else
        {
            $this->havingClause = "\nHAVING " . $conditions;
        }
    }
    
    private function handleWhere($conditions, $joinWithAnd = true)
    {
        // Get conditions.
        $conditions = $this->handleConditions($conditions, $joinWithAnd);
        
        // Add clauses to where clause.
        if ($this->whereClause)
        {
            $this->whereClause .= "\nAND " . $conditions;
        }
        else
        {
            $this->whereClause = "\nWHERE " . $conditions;
        }
    }
    
    private function handleConditions($args, $joinWithAnd = true)
    {
        // Get conditions.
        $conditions = self::argsToArray($args);
        
        // Get clauses.
        $clauses = array();
        foreach ($conditions as $condition)
        {
            $matches = array();
            if (preg_match('/^([a-z][\w\.]*)\s*(>=|<=|!=|<|>|==|=|is not|is|not like|like)\s*(.*?)$/i',
                $condition, $matches))
            {
                $identifier = $this->escapeIdentifier($matches[1]);
                $operator   = $matches[2];
                $value      = $this->escapeIdentifier($matches[3]);
                
                $clauses[] = $identifier . ' ' . $operator . ' ' . $value;
            }
        }
        
        // Implode clauses.
        if ($joinWithAnd)
        {
            return implode("\nAND ", $clauses);
        }
        else
        {
            return '(' . implode(' OR ', $clauses) . ')';
        }
    }
    
    // Escapes a value, returns parameter markers unchanged.
    private function escapeValue($value)
    {
        // Explicitly cast to string.
        $value = (string) $value;
        
        // Check for placeholders.
        if ($value && ($value[0] == ':'))
        {
            return $value;
        }
        else
        {
            return $this->pdo->quote($value);
        }
    }
    
    // Escapes an identifier.
    private function escapeIdentifier($identifier)
    {
        if ($identifier == '*')
        {
            return $identifier;
        }
        
        return preg_replace('/(?<![:\w])(\w+)(?![\(\w])/', '"\1"', $identifier);
    }
    
    // Flattens arguments to an array.
    private static function argsToArray($args)
    {
        if (!is_array($args))
        {
            return $args;
        }
        
        $result = array();
        foreach ($args as $arg)
        {
            if (is_array($arg))
            {
                $result = array_merge($result, $arg);
            }
            else
            {
                $result[] = $arg;
            }
        }
        
        return $result;
    }
    
    // Asserts a condition.
    private function assert($condition, $errorId)
    {
        if (!$condition)
        {
            throw new QueryFormatException($errorId);
        }
    }
}
