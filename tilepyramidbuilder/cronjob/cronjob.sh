#!/bin/bash

# Runs the pyramid builder every five seconds.
# Requires the path to the backend folder as its argument.

#cd /home/abo/AnnotatedBooksOnline/tilepyramidbuilder/cronjob

while true
do
    php tilepyramidbuilder.php "$1" 2>&1 >> "$1"/../data/logs/builderoutput.txt
    sleep 5
done
