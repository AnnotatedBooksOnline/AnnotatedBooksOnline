<?php
//[[GPL]]

require_once 'framework/database/entity.php';
require_once 'util/authentication.php';

/**
 * Entity representing a paragraph in a help page.
 */
class HelpParagraph extends Entity
{    
    /** Identifier. */
    protected $helpParagraphId;
    
    /** The page on which this paragraph is displayed. */
    protected $helpPageId;
    
    /** The paragraph containing this one, or null. */
    protected $paragraphParentId;
    
    /** 
     * The action described by this paragraph (possibly null). Not displayed to users who can't do 
     * this action. 
     */
    protected $actionName;
    
    /** The title of the paragraph. */
    protected $title;
    
    /** The content of the page, in HTML. */
    protected $content;
    
    /** A cached array of subparagraphs. */
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
            $this->helpParagraphId = $id;
            $this->load();
        }
    }
    
    
    // Standard entity functions.
    
    public static function getTableName()
    {
        return 'HelpParagraphs';
    }
    
    public static function getPrimaryKeys()
    {
        return array('helpParagraphId');
    }
    
    public static function getColumns()
    {
        return array('helpPageId', 'paragraphParentId', 'actionName', 'title', 'content');
    }
    
    public static function getColumnTypes()
    {
        return array(
            'helpParagraphId'       => 'int',
            'helpPageId'            => 'int',
            'paragraphParentId'     => 'int',
            'actionName'            => 'string',
            'title'                 => 'string',
            'content'               => 'string'
        );
    }
    
    
    // Helpers.
    
    public function getChildren()
    {
        // Confirm that id is set.
        if($this->helpParagraphId === null)
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
                            ->where('paragraphParentId = :id')
                            ->orderBy('title','ASC')
                            ->execute(array('id' => $this->helpParagraphId));
            
                foreach($citems as $citem)
                {
                    $helpParagraph = new HelpParagraph($citem->getValue('helpParagraphId'));
                    $helpParagraph = $helpParagraph->getValues();
                    if (Authentication::getInstance()->hasPermissionTo($helpParagraph['actionName']))
                    {
                        $this->subItems[] = $helpParagraph;
                    }
                }
        }
        
        return $this->subItems;
    }
    
    public function getValues($columns = null)
    {
        $helpParagraph = parent::getValues($columns);
        $helpParagraph['helpId'] =  $helpParagraph['helpPageId'].','.$helpParagraph['helpParagraphId'];
        $helpParagraph['pageName'] = $helpParagraph['title'];
        return $helpParagraph;
    }
    
    // Getters and setters.
    
    public function getHelpParagraphId()    { return $this->helpParagraphId; }
    public function setHelpParagraphId($id) { $this->helpParagraphId = $id;  }
    
    public function getHelpPageId()    { return $this->helpPageId; }
    public function setHelpPageId($id) { $this->helpPageId = $id;  }
    
    public function getParagraphParentId()    { return $this->paragraphParentId; }
    public function setParagraphParentId($id) { $this->paragraphParentId = $id;  }
    
    public function getActionName()      { return $this->actionName;  }
    public function setActionName($name) { $this->actionName = $name; }
    
    public function getTitle()       { return $this->title;   }
    public function setTitle($title) { $this->title = $title; }
    
    public function getContent()     { return $this->content; }
    public function setContent($con) { $this->content = $con; }
    
    
}

