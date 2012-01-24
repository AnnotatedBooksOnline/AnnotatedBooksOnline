<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/help/helppagelist.php';

/**
 * Help controller class.
 */
class HelpController extends ControllerBase
{
    //TODO filter permissions

    /**
     * Loads help pages.
     */
    public function actionLoad($data)
    {
        $node = self::getString($data, 'node', '', true, 255);
        // Handle load.
        $result = false;
        if($node === 'root')
        {
            $defaultSorters = array(array('column' => 'pageName', 'direction' => 'ASC'));
            $result = $this->handleLoad($data, 'HelpPage', 'helpPageId', null, $defaultSorters);
            $result['total'] = count($result['records']);
        }
        else
        {
            $helpId = explode(',', $node);
            if ($helpId[1]==-1)
            {
                $helpPage = new HelpPage($helpId[0]);
                $result = $this->setLeaves($helpPage);
            }
            else
            {
                $helpParagraph = new HelpParagraph($helpId[1]);
                $result = $this->setLeaves($helpParagraph);
            }
        }
        return $result;
    }
    
    public function setLeaves(&$helpItem)
    {
        $children = $helpItem->getChildren();
                foreach ($children as &$record)
                {
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
