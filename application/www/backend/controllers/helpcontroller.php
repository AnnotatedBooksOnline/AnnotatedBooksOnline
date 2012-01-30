<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/help/helppagelist.php';

/**
 * Help controller class.
 */
class HelpController extends ControllerBase
{
    /**
     * Loads help pages.
     */
    public function actionLoad($data)
    {
        //Retrieve information about the requested node
        $node = self::getString($data, 'node', '', true, 255);
        
        //Return nothing to an illegal request
        $result = false;
        
        //When the children of the root are requested
        if($node === 'root')
        {
            //Find all the help pages and sort them according to their name
            $defaultSorters = array(array('column' => 'pageName', 'direction' => 'ASC'));
            $result = $this->handleLoad($data, 'HelpPage', 'helpPageId', null, $defaultSorters);
            $result['total'] = count($result['records']);
        }
        else
        {
            //Split the id
            $helpId = explode(',', $node);
            
            //Check whether to load the children of a help page or of a help paragraph
            if ($helpId[1]==-1)
            {
                //Load the children of a page
                $helpPage = new HelpPage($helpId[0]);
                $result = $this->setLeaves($helpPage);
            }
            else
            {
                //Load the children of a help paragraph
                $helpParagraph = new HelpParagraph($helpId[1]);
                $result = $this->setLeaves($helpParagraph);
            }
        }
        return $result;
    }
    
    /**
     * Loads the children of the requested node and checks 
     * whether they are leaves or not.
     */
    public function setLeaves(&$helpItem)
    {
        $children = $helpItem->getChildren();
                foreach ($children as &$record)
                {
                    //Check whether a paragraph has children and mark 
                    //them as leaves when this is not the case
                    $help = new HelpParagraph($record['helpParagraphId']);
                    $grandChildren = $help->getChildren();
                    if (empty($grandChildren))
                        {
                            $record['leaf'] = true;
                        }
                }
                return $children;
    }
}
