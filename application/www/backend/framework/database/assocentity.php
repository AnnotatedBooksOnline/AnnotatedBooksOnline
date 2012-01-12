<?php
//[[GPL]]

require_once 'framework/database/database.php';
require_once 'framework/database/entity.php';

/**
 * A specific kind of entity representing 'associative' tables.
 * 
 * A table is considered associative if and only if all its primary keys are also foreign keys and 
 * are not automatically generated when doing an insertion.
 */
abstract class AssociativeEntity extends Entity
{
    /**
     * Overloads save() in such a manner that primary keys should always be set and that a new entry
     * will be created if it does not exist yet.
     */
    public function save()
    {
        // Determine if the primary keys are filled.
        if (!$this->arePrimaryKeysFilled())
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // Get types and values.
        $types  = $this->getTypes();
        $values = $this->getAllValues();
        
        // First do a selection to check whether entry exists (unfortunately PostgreSQL does 
        // not directly support 'INSERT OR UPDATE' syntax).
        $result = $this->getSelectQuery()->execute($this->getPrimaryKeyValues());
        
        if ($result->getAmount() == 0)
        {
            // Entry does not exist, do an insertion.
            $this->getInsertQuery(false)->execute($values, $types);
        }
        else
        {
            // Update existing entry.
            $this->getUpdateQuery()->execute($values, $types);
        }
    }
    
    /**
     * Returns the query needed to insert this entity into the database.
     * 
     * @param $returning If true, a returning clause is added to the query which returns all
     *                   primary keys.
     *
     * @return  Query to insert this entity in the database.
     */
    protected function getInsertQuery($returning = false)
    {
        // Get columns and table name.
        $columns = array_merge(
            $this->getPrimaryKeys(), $this->getColumns(), $this->getDefaultColumns());
        $tableName = $this->getTableName();
        
        // Create values.
        $callback = function($value)
        {
            return ':' . $value;
        };

        $values = array_map($callback, $columns);
        
        // Create query.
        $query = Query::insert($tableName, array_combine($columns, $values));
        
        // Add returning statement.
        if ($returning)
        {
            foreach ($this->getPrimaryKeys() as $key)
            {
                if (!isset($this->{$key}))
                {
                    // It is assumed primary keys that are not included will be generated by the 
                    // database and can therefore be returned. 
                    $query->returning($key);
                }
            }
        }
        
        return $query;
    }
}
