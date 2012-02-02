<?php
//[[GPL]]

// Exceptions
class ResultSetException extends ExceptionBase { }

/**
 * An IteratorAggregate for the results of a query.
 *
 * Can be used to iterate over the rows in the result set of a query.
 *
 * Example:
 * \verbatim
 * $results = $dbc->query('SELECT user_name FROM users WHERE birth_date = %a', unixtojd());
 * foreach($results as $result)
 * {
 *      print 'Happy birthday, ' . $result->getValue('user_name') . '!\n'
 * }
 * \endverbatim
 */
class ResultSet implements IteratorAggregate
{
    private $statement;
    
    /**
     * Constructs a ResultSet from a prepared PDO statement.
     *
     * @param PDOStamement $statement  The PDO statement. Should already have been executed.
     */
    public function __construct($statement)
    {
        $this->statement = $statement;
    }
    
    /**
     * Destructs a ResultSet.
     *
     * @param PDOStamement $statement  The PDO statement. Should already have been executed.
     */
    public function __destruct()
    {
        $this->statement->closeCursor();
    }

    /**
     * Returns an Iterator of a ResultSet.
     */
    public function getIterator()
    {
        return new ResultSetIterator($this, $this->statement);
    }
    
    /**
     * Returns the amount of rows in a ResultSet.
     */
    public function getAmount() 
    {
        return $this->statement->rowCount();
    }
    
    /**
     * Returns first row of a ResultSet or returns null.
     */
    public function tryGetFirstRow()
    {
        $row = $this->statement->fetch(PDO::FETCH_ASSOC);
        
        return ($row ? new ResultSetRow($row) : null);
    }
    
   /**
     * Returns first row of a ResultSet or throws an exception.
     */
    public function getFirstRow()
    {
        $row = $this->statement->fetch(PDO::FETCH_ASSOC);
        if (!$row)
        {
            $err = $this->statement->errorInfo();
            throw new DatabaseException('fetch-failed', $err[2]);
        }
        
        return new ResultSetRow($row);
    }
    
    /**
     * Returns an array of the ResultSet's contents
     */
    public function asArrays() 
    {
        $records = array();
        foreach ($this->getIterator() as $row)
        {
            $records[] = $row->getValues();
        }
        
        return $records;
    }
}

/**
 * An iterator of ResultSetRows used by ResultSet.
 */
class ResultSetIterator implements Iterator
{
    private $rset;
    private $statement;
    private $i;
    private $curr;

    public function __construct($rset, $stat)
    {
        $this->rset      = $rset;
        $this->statement = $stat;
        $this->i         = -1;
        
        $this->next();
    }
    
    /**
     * Returns the next value.
     */
    public function next()
    {
        ++$this->i;
        if ($this->i > $this->statement->rowCount())
        {
            throw new ResultSetException('iterator-out-of-range');
        }
        
        $this->curr = $this->statement->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Returns the current key.
     */
    public function key()
    {
        return $this->i;
    }
    
    /**
     * Returns the current value.
     */
    public function current()
    {
        return new ResultSetRow($this->curr);
    }
    
    /**
     * Checks whether there exists another value.
     */
    public function valid()
    {
        return $this->i < $this->statement->rowCount();
    }
    
    /**
     * Sets the current index to zero.
     */
    public function rewind()
    {
        if ($this->i > 0)
        {
            throw new ResultSetException('cannot-rewind-iterator');
        }
    }
}

/**
 * Contains the items in a result set from a single row.
 */
class ResultSetRow
{
    private $row;

    /**
     * Constructs a ResultSetRow.
     */
    public function __construct($row)
    {
        foreach ($row as $key => $val)
        {
            $this->row[$key] = $val;
        }
    }

    /**
     * Get the value from the column with the specified name as a string.
     *
     * @param string $name  The name of the column, is case incensitive.
     * @param array  $type  Type of the value returned
     *
     * @return  A string representing the value stored at the specified column, or null if there is
     *          no column with this name.
     */
    public function getValue($name, $type = null)
    {
        $value = isset($this->row[$name]) ? $this->row[$name] : null;
        
        return ($type !== null) ? Database::convertFromType($value, $type) : $value;
    }

    /**
     * Returns an associative array with the column names and corresponding values.
     *
     * @param $types  Types of the values returned by column name.
     *
     * @return  The array of row values.
     */
    public function getValues($types = null)
    {
        return ($types !== null) ? Database::convertFromTypes($this->row, $types) : $this->row;
    }
}
