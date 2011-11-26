<?php
//[[GPL

// Set backend as current working directory and include path.
$backendPath = dirname(__FILE__) . '/backend/';

chdir($backendPath);
set_include_path($backendPath);

// Include controller.
require 'framework/controller/controller.php';

// Handle request.
Controller::handleRequest();
