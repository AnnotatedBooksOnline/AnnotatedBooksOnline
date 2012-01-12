<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/language/languagelist.php';

/**
 * Language controller class.
 */
class LanguageController extends ControllerBase
{
    /**
     * Loads languages.
     */
    public function actionLoad($data)
    {
        // Handle load.
        return $this->handleLoad($data, 'Language', 'languageId');
    }
}
