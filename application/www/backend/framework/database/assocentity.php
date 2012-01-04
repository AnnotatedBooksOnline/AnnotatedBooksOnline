<?php
//[[GPL]]

require_once 'framework/database/database.php';
require_once 'framework/database/entity.php';

/**
 * A specific kind of entity representing 'associative' tables.
 * 
 * A table is considered associative if and only if all its primary keys are also foreign keys and 
 * are not automatically generated when doing an insertion.
 *
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
        $types = $this->getTypes();
        $values = $this->getValues();
        
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
}
