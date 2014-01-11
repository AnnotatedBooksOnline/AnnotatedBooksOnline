#!/bin/bash

. common.sh
. install_tasks.sh

check_deps
#link_wwwdir
set_permissions
#create_database
initialize_database
update_database
build_tilebuilder
#install_cronjob
#start_tilebuilder

