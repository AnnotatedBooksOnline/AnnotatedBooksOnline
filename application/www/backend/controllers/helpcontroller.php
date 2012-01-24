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
        $node = self::getString($data, 'node', 'root', true, 255);
        // Handle load.
        $result = false;
        if($node === 'root')
        {
            $result = $this->handleLoad($data, 'HelpPage', 'helpPageId');
            foreach ($result['records'] as $i => &$record)
            {
                $help = new HelpPage($record['helpPageId']);
                $children = $help->getChildren();
                if (!empty($children))
                {
                    $record['HelpId'] = $record['helpPageId'].','.-1;
                }
                else
                {
                    unset($result['records'][$i]);
                }
            }
        }
        else
        {
            $helpId = explode(',', $node);
            if ($helpId[1]==-1)
            {
                $helpPage = new HelpPage($helpId[0]);
                $children = $helpPage->getChildren();
                foreach ($children as &$record)
                {
                    $help = new HelpParagraph($record['helpParagraphId']);
                    $grandChildren = $help->getChildren();
                    if (empty($grandChildren))
                        {
                            $record['leaf'] = true;
                        }
                    $record['HelpId'] = $record['helpPageId'].','.$record['helpParagraphId'];
                    $record['pageName'] = $record['title'];
                }
                $result = $children;
            }
            else
            {
                $helpParagraph = new HelpParagraph($helpId[1]);
                $children = $helpParagraph->getChildren();
                foreach ($children as &$record)
                {
                    $help = new HelpParagraph($record['helpParagraphId']);
                    $grandChildren = $help->getChildren();
                    if (empty($grandChildren))
                        {
                            $record['leaf'] = true;
                        }
                    $record['HelpId'] = $record['helpPageId'].','.$record['helpParagraphId'];
                    $record['pageName'] = $record['title'];
                }
                $result = $children;
            }
        }
        return $result;
    }
}
