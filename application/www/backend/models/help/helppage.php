<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/help/helpcontrolitem.php';

/**
 * Entity representing a help page.
 */
class HelpPage extends Entity
{    
    /** Identifier. */
    protected $helpPageId;
    
    /** The name of the page. */
    protected $pageName;
    
    /** The content of the page, in HTML. */
    protected $content;
    
    /** The parent page, if any. */
    protected $parentHelpPageId;

    
    /** A cached array of subpages and contained control items. */
    private $subItems;
    
    
    /**
     * Constructs a HelpPage by id.
     *
     * @param int $id Id of the page. Default (null) will create a new help page.
     */
    public function __construct($id = null)
    {
        if ($id !== null)
        {
            $this->helpPageId = $id;
            $this->load();
        }
    }
    
    
    // Standard entity functions.
    
    public static function getTableName()
    {
        return 'HelpPages';
    }
    
    public static function getPrimaryKeys()
    {
        return array('helpPageId');
    }
    
    public static function getColumns()
    {
        return array('pageName', 'content', 'parentHelpPageId');
    }
    
    public static function getColumnTypes()
    {
        return array(
            'helpPageId'       => 'int',
            'pageName'         => 'string',
            'content'          => 'string',
            'parentHelpPageId' => 'int'
        );
    }
    
    
    // Helpers.
    
    /**
     * Get and load all subpages and control items contained by this page.  
     *
     * @return array An array of loaded HelpPage and HelpContolItem entities. 
     * 
     * @throws EntityException If the parentHelpPageId of this entity is not set.
     */
    public function getChildren()
    {
        // Confirm that id is set.
        if($this->parentHelpPageId === null)
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // If not yet set, load children.
        if($this->subItems === null)
        {
            $this->subItems = array();
            
            // Query all subpages.
            $pages = $this->getSelectQuery()->where('parentHelpPageId = :id')
                                            ->execute(array('id' => $this->helpPageId));
            
            // Query contained HelpControlItems.
            $citems = Query::select('controlItemName')
                           ->from('HelpContolItems')
                           ->where('helpPageId = :id')
                           ->execute(array('id' => $this->helpPageId));
            
            
            // Add loaded entities to result.
            foreach($pages as $page)
            {
                $this->subItems[] = new HelpPage($page->getValue('helpPageId'));
            }
            foreach($citems as $citem)
            {
                $this->subItems[] = new HelpContolItem($citem->getValue('controlItemId'));
            }
        }
        
        return $this->subItems;
    }
    
    
    // Getters and setters.
    
    public function getHelpPageId()    { return $this->helpPageId; }
    public function setHelpPageId($id) { $this->helpPageId = $id;  }
    
    public function getPageName()      { return $this->pageName;  }
    public function setPageName($name) { $this->pageName = $name; }
    
    public function getContent()     { return $this->content; }
    public function setContent($con) { $this->content = $con; }
    
    public function getParentHelpPageId()    { return $this->parentHelpPageId; }
    public function setParentHelpPageId($id) { $this->parentHelpPageId = $id;  }
}