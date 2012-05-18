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

require_once 'framework/controller/controller.php';

/**
 * Controller base class.
 */
abstract class ControllerBase extends Controller
{
    /**
     * Generalizes a load query.
     * 
     * @param array  $data The data to load.
     * @param string $type The type of entity to load. There should be an EntityList of this type.
     * @param string $idColumn Which column contains the identifiers.
     * @param array  $columns Which columns to load.
     * @param array  $defaultSorters The sorters to use at the database level.
     * @param array  $entitySorters  Sorters used after the query at PHP-level. For each entry in
     *                                this array, EntityList::sortBy is called on the loaded entity
     *                                list with the key as its first and the value as its second 
     *                                argument.
     */
    protected function handleLoad($data, $type, $idColumn = null, $columns = null,
                                    array $defaultSorters = array(),
                                    array $entitySorters = array())
    {
        // Set entity list type.
        $entityListType = $type . 'List';
        
        // Retrieve the limit and offset for the search from the data.
        $limit  = self::getInteger($data, 'limit',  -1);
        $offset = self::getInteger($data, 'offset', 0,  true, 0);
        
        // Check limit.
        if ($limit < 0)
        {
            $limit = null;
        }
        
        // Retrieve the search filters from the data.
        $filters    = self::getArray($data, 'filters');
        $conditions = array();
        if (isset($data['filters']))
        {
            $filterProperties = array();
            foreach ($filters as $filter)
            {
                $column = self::getString($filter, 'column');
                $value  = self::getString($filter, 'value');
                if ($column && $value)
                {
                    $conditions[$column] = $value;
                }
            }
        }
        
        // Retrieve the entity id from the data.
        $id = self::getString($data, 'id');
        
        // Check for id.
        if ($id !== '')
        {
            if ($idColumn === null)
            {
                throw new ControllerException('id-query-not-supported');
            }
            
            $conditions[$idColumn] = $id;
        }
        
        // Retrieve the sortings from the data.
        $sorters  = array_merge(self::getArray($data, 'sorters'), $defaultSorters);
        $ordering = array();
        if ($sorters)
        {
            foreach ($sorters as $sorting)
            {
                $column    = self::getString($sorting, 'column');
                $direction = self::getString($sorting, 'direction');
                if ($column && $direction)
                {
                    $ordering[$column] = $direction;
                }
            }
        }
        
        // Find those entities.
        $total = 0;
        $entityList = $entityListType::find($conditions, $offset, $limit, $ordering, $total);
        
        // Apply entity sorters.
        foreach($entitySorters as $column => $comparator)
        {
            $entityList->sortBy($column, $comparator);
        }
        
        // Get values.
        $records = $entityList->getValues($columns);
        
        // Return the results.
        return array(
            'records' => $records,
            'total'   => $total
        );
    }
}

