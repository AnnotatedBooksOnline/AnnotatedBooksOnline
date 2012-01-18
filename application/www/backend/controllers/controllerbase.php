<?php
//[[GPL]]

require_once 'framework/controller/controller.php';

/**
 * Controller base class.
 */
abstract class ControllerBase extends Controller
{
    /**
     * Generalizes a load query.
     */
    protected function handleLoad($data, $type, $idColumn = null, $columns = null)
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
        $sorters  = self::getArray($data, 'sorters');
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
        
        // Get values.
        $records = $entityList->getValues($columns);
        
        // Return the results.
        return array(
            'records' => $records,
            'total'   => $total
        );
    }
}
