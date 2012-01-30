<?php 
//[[GPL]]

require_once 'models/help/helppage.php';
require_once 'framework/database/entitylist.php';

/**
 * Class representing a help entity list.
 */
class HelpPageList extends EntityList 
{
    public function add($helpPage)
    {
        //Only add help pages which have children.
        $children = $helpPage->getChildren();
        if(!empty($children))
        {
            parent::add($helpPage);
        }
    }
}
