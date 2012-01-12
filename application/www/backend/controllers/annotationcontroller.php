<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/annotation/annotationlist.php';

/**
 * Annotation controller class.
 */
class AnnotationController extends ControllerBase
{
    /**
     * Loads annotations.
     */
    public function actionLoad($data)
    {
        // Handle load.
        return $this->handleLoad($data, 'Annotation', 'annotationId');
    }
}
