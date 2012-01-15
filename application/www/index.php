<?php
//[[GPL

// Ensure the content is accessed securely.
if ($_SERVER["HTTPS"] != "on")
{
    header("Location: https://" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]);
    exit();
}

// Set backend as current working directory and include path.
$backendPath = dirname(__FILE__) . '/backend/';

chdir($backendPath);
set_include_path($backendPath);

date_default_timezone_set('GMT');

// Include controller.
require 'framework/controller/controller.php';

// Handle request.
Controller::handleRequest();

