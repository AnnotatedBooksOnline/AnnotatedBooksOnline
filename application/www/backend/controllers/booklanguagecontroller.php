<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/language/language.php';

/**
 * Book language controller class.
 */
class BookLanguageController extends ControllerBase
{
    /**
     * Loads languages associated to books.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $result = $this->handleLoad($data, 'BookLanguage');
                
        // Also load the name of each language.
        foreach ($result['records'] as &$record)
        {
            $language = new Language($record['languageId']);
            
            $record['languageName'] = $language->getLanguageName();
        }
        
        return $result;
    }
}