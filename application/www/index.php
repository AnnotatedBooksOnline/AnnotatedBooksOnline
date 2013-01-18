<?php
/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * Copyright: Mathijs Baaijens, Iris Bekker, Renze Droog,
 * Maarten van Duren, Jeroen Hanselman, Bert Massop, Robin van der Ploeg,
 * Tom Tervoort, Gerben van Veenendaal, Tom Wennink.
 */

// Set backend as current working directory and include path.
$backendPath = dirname(__FILE__) . '/backend/';

// Define the 'application path' as the directory that lies one above the webroot.
// In here, configuration, log and cache files are stored.
global $applicationPath;
$applicationPath = dirname(__FILE__) . '/../';

chdir($backendPath);
set_include_path($backendPath);

date_default_timezone_set('UTC');

// Include controller.
require 'framework/controller/controller.php';

// Handle request.
Controller::handleRequest();
