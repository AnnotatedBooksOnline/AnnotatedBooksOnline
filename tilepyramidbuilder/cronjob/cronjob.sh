#!/bin/bash

# Runs the pyramid builder every five seconds.
# Requires the path to the backend folder as its argument.

MY_DIR="$0"

cd "$(dirname $MY_DIR)"

while true
do
    echo -n "." >> "$1"/../../logs/builderoutput.txt
    php tilepyramidbuilder.php "$1" >> "$1"/../../logs/builderoutput.txt 2>&1
    sleep 5
done
