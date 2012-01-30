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
    
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'HelpPages';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('helpPageId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('pageName', 'helpType');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'helpPageId'       => 'int',
            'pageName'         => 'string',
            'helpType'         => 'string'
        );
    }
    
    
    /**
     * Returns all the children of a node based on the current permissions
     *
     * @return  Array of help paragraphs.
     */
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
            
            // Temporary variable to store introduction paragraph
            $introduction;
            
            foreach($citems as $citem)
            {
                $helpParagraph = new HelpParagraph($citem->getValue('helpParagraphId'));
                $helpParagraph = $helpParagraph->getValues();
                
                // Check whether the user has permission to view this help paragraph.
                if (Authentication::getInstance()->hasPermissionTo($helpParagraph['actionName']))
                {
                    // Store the introduction paragraph.
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
            // When there is an introduction paragraph, put it up front. 
            if (isset($introduction))
            {
                array_unshift($this->subItems,$introduction);
            }
        }
        // Return the children of this node.
        return $this->subItems;
    }
    
    
    public function getValues($columns = null)
    {
        $helpPage = parent::getValues($columns);
        
        //Also return the id consisting of the id of the help page ande the help paragraph
        $helpPage['helpId'] =  $helpPage['helpPageId'].','.-1;
        return $helpPage;
    }
    
    /**
     * Getters and setters.
     */
    
    public function getHelpPageId()    { return $this->helpPageId; }
    public function setHelpPageId($id) { $this->helpPageId = $id;  }
    
    public function getPageName()      { return $this->pageName;  }
    public function setPageName($name) { $this->pageName = $name; }
    
    public function getContent()     { return $this->content; }
    public function setContent($con) { $this->content = $con; }
    
    public function getParentHelpPageId()    { return $this->parentHelpPageId; }
    public function setParentHelpPageId($id) { $this->parentHelpPageId = $id;  }
    
    public function getHelpType()      { return $this->helpType; }
    public function setHelpType($type) { $this->helpType = $type;  }
    
}

