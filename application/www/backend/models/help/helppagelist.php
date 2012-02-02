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
