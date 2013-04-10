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

// Get backend directory from php arguments.
$backendPath = $argv[1];

chdir($backendPath);
set_include_path($backendPath);

// Define the 'application path' as the directory that lies two above the backend path.
// In here, configuration, log and cache files are stored.
global $applicationPath;
$applicationPath = "$backendPath/../../";

date_default_timezone_set('UTC');

umask(0000);

// Include tile pyramid builder.
require 'util/tilepyramidbuilder.php';

// Do an iteration.
TilePyramidBuilder::getInstance()->doIteration();
