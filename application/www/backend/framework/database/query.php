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

/**
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
    
    /** Boolean representing whether to return the inserted Id. */
    private $doReturnId;
    
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
     * Helper methods.
     */
    
    /**
     * Clears all query elements that have been set.
     *
     * @param array $fields The elements to clear. When null (default), will clear all elements.
     */
    public function clear($fields = null)
    {
        if ($fields === null)
        {
            $this->columns         = array();
            $this->tables          = array();
            $this->joinClause      = '';
            $this->whereClause     = '';
            $this->havingClause    = '';
            $this->groupByClause   = '';
            $this->orderByClause   = '';
            $this->limitClause     = '';
            $this->doReturnId      = false;
        }
        else
        {
            $fields = self::argsToArray(func_get_args());
            foreach ($fields as $field)
            {
                switch ($field)
                {
                    case 'columns':
                        $this->columns = array();
                        break;
                    case 'tables':
                        $this->tables = array();
                        break;
                    case 'join':
                        $this->joinClause = '';
                        break;
                    case 'where':
                        $this->whereClause = '';
                        break;
                    case 'having':
                        $this->havingClause = '';
                        break;
                    case 'groupBy':
                        $this->groupByClause = '';
                        break;
                    case 'orderBy':
                        $this->orderByClause = '';
                        break;
                    case 'limit':
                        $this->limitClause = '';
                        break;
                    case 'returnId':
                        $this->doReturnId = false;
                        break;
                    default:
                        break;
                }
            }
        }
        
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
     * @param ... SQL Identifiers representing columns to limit the result of the selection to.
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
        
        $this->kind    = 'SELECT';
        $this->columns = array_merge($this->columns,
            array_map(array($this, 'escapeIdentifier'), $columns));
        
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
    
    /**
     * Makes the query return the inserted Id.
     */
    public function returnId()
    {
        $this->assert($this->kind == 'INSERT', 'return-without-insert');
        $this->doReturnId = true;
        
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
    
    private function coalesceEmpty($identifier)
    {
        return 'COALESCE(' . $identifier . ', \'\')';
    }
    
    /**
     * A specific where implementation for fulltext searches.
     */
    public function whereFulltext($column, $query, $result = null, $orNull = false, $fast = false)
    {
        $column = $this->escapeIdentifier($column);        
        $query = $this->escapeIdentifier($query);
        
        if ($fast)
        {
            $condition = 'MATCH (' . $column . ') AGAINST (' . $query . ' IN BOOLEAN MODE)';
        }
        else
        {
            $condition = 'fulltextsearch(' . $column . ', ' . $query . ')';
        }
        
        if ($result !== null)
        {
            $result = $this->escapeIdentifier($result);
            $this->tables[] = $condition . ' AS ' . $result;
        }
        
        if ($orNull)
        {
            $condition = '(' . $condition . ' OR LENGTH(TRIM(' . $column . ')) <= 3)';
        }
        
        // Add clauses to where clause.
        if ($this->whereClause)
        {
            $this->whereClause .= "\nAND " . $condition;
        }
        else
        {
            $this->whereClause = "\nWHERE " . $condition;
        }
        
        return $this;
    }
    
    /*
     * Ordering.
     */
    
    public function limit($limit = null, $offset = 0)
    {
        $limit  = ($limit === null) ? 999999999999 : max(intval($limit),  0);
        $offset = max(intval($offset), 0);
        
        $this->limitClause = "\nLIMIT " . $limit . ($offset ? "\nOFFSET " . $offset : '');

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
        if (is_array($column))
        {
            foreach ($column as $name => $direction)
            {
                $this->orderBy($name, $direction);
            }
        }
        else
        {
            // Check type.
            $direction = (strtolower($direction) != 'desc') ? 'ASC' : 'DESC';
            
            // Add order by clause.
            if ($this->orderByClause != '')
            {
                $this->orderByClause .= ", " . $this->escapeIdentifier($column) . ' ' . $direction;
            }
            else
            {
                $this->orderByClause .= "\nORDER BY " . $this->escapeIdentifier($column) . ' ' . $direction;
            }
        }
        
        return $this;
    }
    
    /*
     * Execution.
     */
    
    public function execute($arguments = array(), $types = null)
    {
        if ($this->doReturnId)
        {
            Database::getInstance()->execute($this->build(), $arguments, $types);
            return Database::getInstance()->execute('SELECT LAST_INSERT_ID() AS "id"');
        }
        return Database::getInstance()->execute($this->build(), $arguments, $types);
    }
    
    /*
     * Private members.
     */
    
    /**
     * Builds the query. It does not clear the query afterwards.
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
                
                $query .= "\nSET " . implode(', ', $columns);
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
        if (!$conditions)
        {
            return;
        }
        
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
        if (!$conditions)
        {
            return;
        }
        
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
            // The operators, note that order is important for the regular expression to match.
            $operators = array(
                '<>',
                '>=',
                '<=',
                '!=',
                '<',
                '>',
                '==',
                '=',
                'is not',
                'is',
                'not like',
                'like',
                '!~[*]',
                '~[*]'
            );
            
            // Handle operator.
            if (preg_match('/^([a-z][\w\.]*)\s*(' . implode('|', $operators) . ')\s*(.*?)$/i',
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
        // If null or initialized, return 'NULL'.
        if ($value === null)
        {
            return 'NULL';
        } 
        else if (is_bool($value))
        {
            // If a boolean, return '1' or '0'.
            return $value ? "'1'" : "'0'";
        }
        
        // Explicitly cast to string.
        $value = (string) $value;
        
        // Check for placeholders.
        if ($value && ($value[0] == ':'))
        {
            return $value;
        }
        else
        {
            return Database::getInstance()->escape($value);
        }
    }
    
    // Escapes an identifier.
    private function escapeIdentifier($identifier)
    {
        if ($identifier == '*')
        {
            return $identifier;
        }
        
        // Escape all column names. 'DISTINCT' or 'NULL', when used as a keyword, should not be escaped.
        return preg_replace(
            array('/(?<![:\w])(\w+)(?![\(\w])/', '/(?<!\.)"(as|distinct|null|collate|max|min|utf8_bin)"(?!\.)/i'),
            array('"\1"', '\1'),
            $identifier
        );
    }
    
    // Flattens arguments to an array.
    private static function argsToArray($args)
    {
        if (!is_array($args))
        {
            return array($args);
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

