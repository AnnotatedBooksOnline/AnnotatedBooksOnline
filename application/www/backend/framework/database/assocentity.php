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
            if (count($this->getPrimaryKeys() == 1))
            {
                $query->returnId();
            }
            else
            {
                throw new EntityException('entity-returning-multiple-keys');
            }
        }
        
        return $query;
    }
}
