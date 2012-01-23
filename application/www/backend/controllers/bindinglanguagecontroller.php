<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/language/language.php';

/**
 * Binding controller class.
 */
class BindingLanguageController extends ControllerBase
{
    /**
     * Loads provenances.
     */
    public function actionLoad($data)
    {
        // Handle load.
        $result = $this->handleLoad($data, 'BindingLanguage');
        
        // Also load the name of each language.
        foreach ($result['records'] as &$record)
        {
            $language = new Language($record['languageId']);
            
            $record['languageName'] = $language->getLanguageName();
        }
        
        return $result;
    }
}