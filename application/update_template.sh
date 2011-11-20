#!/bin/bash

ENVIRONMENT="systeemtest"
BRANCH="master"
VERSION_TO_DEPLOY="increment_A_1_test1"

echo "Removing old version"
ls * | grep -v "tiles" | grep -v "update.sh" | xargs rm -rf

echo "Cloning repository.."
git clone /home/git/application.git/

echo "Checking out branch..."
cd application
git checkout -b $master $VERSION_TO_DEPLOY 
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
cp -f application/tilepyramidbuilder/pyramid_builder bin/pyramid_builder
