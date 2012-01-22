<?php 
//[[GPL]]

require_once 'models/scan/scan.php';
require_once 'framework/database/entitylist.php';

/**
 * Class representing a scan entity list.
 */
class ScanList extends EntityList {
    
    protected static function buildSelectionQuery()
    {
        // Join the book the scan currently belongs to.
        $columns = static::getColumns();
        //array_push($columns, "Books.title as bookTitle")
       // 'scanId', 'bindingId', 'page', 'status', 'width', 'height', 'zoomLevel', 'uploadId', 'scanName', 'bookTitle'
        
        return Query::select("scanId",
                             "Scans.bindingId as bindingId",
                             "page",
                             "status",
                             "width",
                             "height",
                             "zoomLevel",
                             "uploadId",
                             "scanName",
                             "Books.title as bookTitle")->
            from(self::getTableName())->
            join("Books", 
                 array("Books.firstPage <= Scans.page",
        			   "Books.lastPage >= Scans.page",
        			   "Books.bindingId = Scans.bindingId"), 
        		 "LEFT OUTER");
    }
}
