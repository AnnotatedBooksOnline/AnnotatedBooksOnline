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

require_once 'framework/database/entity.php';
require_once 'util/authentication.php';
require_once 'models/setting/setting.php';

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
    
    /** If not null, the content depends on this setting. */
    protected $settingName;
    
    
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
    
    
    /**
     * Gets the table name.
     *
     * @return  The table name.
     */
    public static function getTableName()
    {
        return 'HelpParagraphs';
    }
    
    /**
     * Gets the primary keys.
     *
     * @return  Array of all primary keys.
     */
    public static function getPrimaryKeys()
    {
        return array('helpParagraphId');
    }
    
    /**
     * Gets all the columns.
     *
     * @return  Array of all columns, except primary keys.
     */
    public static function getColumns()
    {
        return array('helpPageId', 'paragraphParentId', 'actionName', 'title', 'settingName');
    }
    
    /**
     * Gets all the column types, per column, including primary keys.
     *
     * @return  Array of all column types.
     */
    public static function getColumnTypes()
    {
        return array(
            'helpParagraphId'       => 'int',
            'helpPageId'            => 'int',
            'paragraphParentId'     => 'int',
            'actionName'            => 'istring',
            'title'                 => 'istring',
            'settingName'           => 'istring'
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
                    // Check whether the user has permission to view this help paragraph.
                    if (Authentication::getInstance()->hasPermissionTo($helpParagraph['actionName']))
                    {
                        $this->subItems[] = $helpParagraph;
                    }
                }
        }
        // Return the children of this node.
        return $this->subItems;
    }
    
    public function getValues($columns = null)
    {
        $helpParagraph = parent::getValues($columns);
        //Also return the id consisting of the id of the help page ande the help paragraph
        $helpParagraph['helpId'] =  $helpParagraph['helpPageId'].','.$helpParagraph['helpParagraphId'];
        
        $helpParagraph['pageName'] = $helpParagraph['title'];
        $helpParagraph['content'] = $this->getContent();
        return $helpParagraph;
    }
    
    /**
     * Getters and setters.
     */
    
    
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
    
    public function getSettingName()      { return $this->settingName;  }
    public function setSettingName($name) { $this->settingName = $name; }
    
    public function getHelpType()      { return $this->helpType; }
    public function setHelpType($type) { $this->helpType = $type;  }
    
    /**
     * Retrieves the HTML content of this paragraph using the HelpContents table.
     * 
     * The entity should be loaded before this is called.
     * 
     * @return string The content of this paragraph.
     */
    public function getContent()
    {
        $query = Query::select('content')->from('HelpContents')
                                         ->where('helpParagraphId = :paragraph');
        $args = array('paragraph' => $this->helpParagraphId);
        
        if($this->settingName === null)
        {
            $query->where('settingValue IS NULL');
        }
        else
        {
            $query->where('settingValue = :setting');
            $args['setting'] = Setting::getSetting($this->settingName);
        }
        
        $row = $query->execute($args)->tryGetFirstRow();
        
        if($row === null)
        {
            throw new EntityException('entity-record-not-found');
        }
        else
        {
            return $row->getValue('content');
        }
    }
}

