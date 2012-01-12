<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/help/helppage.php';

/**
 * Entity representing a so-called control item of a help page.
 */
class HelpControlItem extends Entity
{
    /** Name and primary key of the control item. */
    protected $controlItemName;
    
    /** Page to which this item belongs. */
    protected $helpPageId;
    
    /** A marker in the page being referred that should be jumped to when clicking on this item. */
    protected $marker;
    
    /**
    * Constructs a HelpControlItem by name.
    *
    * @param string $name Name of the control item. Default (null) will create a new one.
    */
    public function __construct($name = null)
    {
        if($name !== null)
        {
            $this->controlItemName = $name;
            $this->load();
        }
    }
    
    
    // Standard entity functions.
    
    public static function getTableName()
    {
        return 'HelpControlItems';
    }
    
    public static function getPrimaryKeys()
    {
        return array('controlItemName');
    }
    
    public static function getColumns()
    {
        return array('helpPageId', 'marker');
    }
    
    public static function getColumnTypes()
    {
        return array(
            'controlItemName' => 'string',
            'helpPageId'      => 'int',
            'marker'          => 'string'
        );
    }
    
    
    // Getters and setters.
    
    public function getControlItemName()      { return $this->controlItemName;  }
    public function setControlItemName($name) { $this->controlItemName = $name; }
    
    public function getHelpPageId()    { return $this->helpPageId; }
    public function setHelpPageId($id) { $this->helpPageId = $id;  }
    
    public function getMarker()        { return $this->marker;    }
    public function setMarker($marker) { $this->marker = $marker; }
}