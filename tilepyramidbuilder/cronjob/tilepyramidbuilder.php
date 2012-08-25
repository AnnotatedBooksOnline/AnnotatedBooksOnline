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

// Set the path of the configuration file, this is relative to the backend/working directory.
global $configPath;
$configPath = "../../config/config.ini";

date_default_timezone_set('UTC');

// Include tile pyramid builder.
require 'util/tilepyramidbuilder.php';

// Do an iteration.
TilePyramidBuilder::getInstance()->doIteration();
