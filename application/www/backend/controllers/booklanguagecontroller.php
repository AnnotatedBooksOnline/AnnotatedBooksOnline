<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/binding/bindinglist.php';
require_once 'models/language/language.php';

/**
 * Binding controller class.
 */
class BookLanguageController extends ControllerBase
{
    /**
     * Loads provenances.
     */
    public function actionLoad($data)
    {
        // Handle load.
        return $this->handleLoad($data, 'BookLanguage');
    }
}