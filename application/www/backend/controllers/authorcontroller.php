<?php
//[[GPL]]

require_once 'controllers/controllerbase.php';
require_once 'models/author/authorlist.php';

/**
 * Author controller class.
 */
class AuthorController extends ControllerBase
{
    /**
     * Loads authors.
     */
    public function actionLoad($data)
    {
        // Handle load.
        return $this->handleLoad($data, 'Author');
    }
}
