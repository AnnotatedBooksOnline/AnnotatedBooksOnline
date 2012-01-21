<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/help/helpparagraph.php';

/**
 * Entity representing a help page.
 */
class HelpPage extends Entity
{    
    /** Identifier. */
    protected $helpPageId;
    
    /** The name of the page. */
    protected $pageName;
    
    /** A cached array of paragraphs. */
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
        return array('pageName');
    }
    
    public static function getColumnTypes()
    {
        return array(
            'helpPageId'       => 'int',
            'pageName'         => 'string'
        );
    }
    
    
    // Helpers.
    
    public function getChildren()
    {
        // Confirm that id is set.
        if($this->helpPageId === null)
        {
            throw new EntityException('entity-primary-keys-not-set');
        }
        
        // If not yet set, load children.
        if($this->subItems === null)
        {
            $this->subItems = array();
            
            // Query contained paragraphs (but not their children).
            $citems = Query::select('helpParagraphId')
                           ->from('HelpParagraphs')
                           ->where('helpPageId = :id AND paragraphParentId IS NULL')
                           ->execute(array('id' => $this->helpPageId));
            
            foreach($citems as $citem)
            {
                $this->subItems[] = new HelpParagraph($citem->getValue('controlItemId'));
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