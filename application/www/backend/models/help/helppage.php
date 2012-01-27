<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'models/help/helpparagraph.php';
require_once 'util/authentication.php';

/**
 * Entity representing a help page.
 */
class HelpPage extends Entity
{    
    /** Identifier. */
    protected $helpPageId;
    
    /** The name of the page. */
    protected $pageName;
    
    /** The type of the page. */
    protected $helpType;
    
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
        return array('pageName', 'helpType');
    }
    
    public static function getColumnTypes()
    {
        return array(
            'helpPageId'       => 'int',
            'pageName'         => 'string',
            'helpType'         => 'string'
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
                           ->where('helpPageId = :id', 'paragraphParentId IS NULL')
                           ->orderBy('title','ASC')
                           ->execute(array('id' => $this->helpPageId));
            
            $introduction;
            foreach($citems as $citem)
            {
                $helpParagraph = new HelpParagraph($citem->getValue('helpParagraphId'));
                $helpParagraph = $helpParagraph->getValues();
                if (Authentication::getInstance()->hasPermissionTo($helpParagraph['actionName']))
                {
                    if ($helpParagraph['title'] == 'Introduction')
                    {
                        $introduction = $helpParagraph;
                    }
                    else
                    {
                        $this->subItems[] = $helpParagraph;
                    }
                }
            }
            if (isset($introduction))
            {
                array_unshift($this->subItems,$introduction);
            }
        }
        
        return $this->subItems;
    }
    
    public function getValues($columns = null)
    {
        $helpPage = parent::getValues($columns);
        $helpPage['helpId'] =  $helpPage['helpPageId'].','.-1;
        return $helpPage;
    }
    
    // Getters and setters.
    
    public function getHelpType()    { return $this->helpType; }
    public function setHelpType($type) { $this->helpType = $type;  }
    
    public function getHelpPageId()    { return $this->helpPageId; }
    public function setHelpPageId($id) { $this->helpPageId = $id;  }
    
    public function getPageName()      { return $this->pageName;  }
    public function setPageName($name) { $this->pageName = $name; }
    
    public function getContent()     { return $this->content; }
    public function setContent($con) { $this->content = $con; }
    
    public function getParentHelpPageId()    { return $this->parentHelpPageId; }
    public function setParentHelpPageId($id) { $this->parentHelpPageId = $id;  }
}

