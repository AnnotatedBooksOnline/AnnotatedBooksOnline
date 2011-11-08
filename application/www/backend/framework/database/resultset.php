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
     * @param PDOStamement  $statement  The PDO statement. Should already have been executed.
     */
    public function __construct($statement)
    {
        $this->statement = $statement;
    }

    public function __destruct()
    {
        $this->statement->closeCursor();
    }

    public function getIterator()
    {
        return new ResultSetIterator($this, $this->statement);
    }
    
    public function getAmount() 
    {
        return $this->statement->rowCount();
    }
    
    public function getFirstRow()
    {
        $row = $this->statement->fetch(PDO::FETCH_ASSOC);
        if (!$row)
        {
            // TODO: Throw error.
        }
        
        return new ResultSetRow($row);
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

    public function next()
    {
        ++$this->i;
        if ($this->i > $this->statement->rowCount())
        {
            throw new ResultSetException('iterator-out-of-range');
        }

        $this->curr = $this->statement->fetch(PDO::FETCH_ASSOC);
    }

    public function key()
    {
        return $this->i;
    }

    public function current()
    {
        return new ResultSetRow($this->curr);
    }

    public function valid()
    {
        return $this->i < $this->statement->rowCount();
    }

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
    private $rowCase;

    public function __construct($row)
    {
        foreach ($row as $key => $val)
        {
            $this->row[$key] = $val;
            $this->rowCase[strtoupper($key)] = $key;
        }
    }

    /**
     * Get the value from the column with the specified name as a string.
     *
     * @param string $columnname The name of the column, is case incensitive.
     *
     * @return A string representing the value stored at the specified column, or NULL if there is
     *            no column with this name.
     */
    public function getValue($columnname)
    {
        if (array_key_exists(strtoupper($columnname), $this->rowCase))
        {
            return $this->row[$this->rowCase[strtoupper($columnname)]];
        }
        else
        {
            return NULL;
        }
    }

    // TODO: get value as number, date, blob etc.

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
