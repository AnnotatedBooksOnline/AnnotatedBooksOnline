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
        
        return $result;
    }
}