<?php
//[[GPL]]

require_once 'framework/controller/controller.php';
require_once 'models/language/language.php';

/**
 * Language controller class.
 */
class LanguageController extends Controller
{
    /**
     * Loads language(s).
     */
    public function actionLoad($data)
    {
        $languages = Language::getAvailableLanguages();
        
        foreach($languages as $lang)
        {
            $result[] = $lang->getValues();
        }
        
        return $result;
        
        return array(
            'records' => $languages, 
            'total'   => $total
        );
    }
}

