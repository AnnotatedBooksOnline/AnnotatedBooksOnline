#!/bin/bash

ENVIRONMENT="devtest"
VERSION_TO_DEPLOY="master"

if [ -n "$1" ]
then
    VERSION_TO_DEPLOY="$1"
fi

echo "Removing old version"
ls -1 | grep -v "tiles" | grep -v "data" | grep -v "update.sh" | grep -v "update.php" | xargs rm -rf

echo "Cloning repository.."
git clone /home/git/application.git/ 2>/dev/null >/dev/null

echo "Checking out branch..."
cd application
git checkout $VERSION_TO_DEPLOY 2>/dev/null >/dev/null
cd ..

echo "Deploying application..."
cp -R application/application/www/* .

echo "Deploying properties..."
cp -f "application/application/www/backend/config/${ENVIRONMENT}/config.ini" "backend/config/config.ini"
chown -R apache:apache *

sed -i "s/#COLLABVERSION#/${ENVIRONMENT} ${VERSION_TO_DEPLOY}/g" frontend/views/applicationviewport.js

echo "Compiling pyramid builder..."
cd application/tilepyramidbuilder
g++ -O3 *.cpp -o pyramid_builder -ljpeg -ltiff
cd ../..

rm -rf bin
mkdir bin
cp -f application/tilepyramidbuilder/pyramid_builder bin/tilepyramidbuilder

echo "Deploying cronjob..."
old_php_instance=$(ps aux | grep "php cronjob/pyramidbuilder" | grep $ENVIRONMENT | grep -v "grep" | awk '{print $2}')

# TODO : TBH I dont think this does what i want it to do :D
if [ -n $old_php_instance ];
then
    echo "Found and killing old tilebuilder instance ${old_php_instance}"
    kill -9 $old_php_instance
else
    echo "No old tilebuilder instance found"
fi

cp -rf application/tilepyramidbuilder/cronjob cronjob
# TODO : Make it run under 'application'? Right now it is apache else update.php doesn't like it.
if [ "$(whoami)" = "apache" ];
then
    nohup php cronjob/pyramidbuilder.php "/var/www/html/${ENVIRONMENT}/backend" 2>/dev/null 1>/dev/null &
else
    sudo -u apache nohup php cronjob/pyramidbuilder.php "/var/www/html/${ENVIRONMENT}/backend" 2>/dev/null 1>/dev/null &
fi

echo "Applying database scripts..."
cd application/application/sqlscripts/updates
lastupdate=$(echo update*_*.sql | tr " " "\n" | sed 's/update\([0-9]\+\)_.*/\1/' | sort -n | tail -n 1)
for i in $(seq 0 $lastupdate)
do
    cat update${i}_$(($i+1)).sql | psql $ENVIRONMENT application 2>/dev/null >/dev/null
done
cd ../../../..

echo "Done."

