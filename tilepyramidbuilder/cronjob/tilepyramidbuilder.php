<?php
//[[GPL]]

// Get backend directory from php arguments.
$backendPath = $argv[1];

chdir($backendPath);
set_include_path($backendPath);

date_default_timezone_set('UTC');

// Include tile pyramid builder.
require 'util/tilepyramidbuilder.php';

// Run the builder.
TilePyramidBuilder::getInstance()->runBuilder();
