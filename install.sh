#!/bin/bash

. common.sh

# Check if g++, libtiff and libjpeg are installed.
if ! g++ -ljpeg -ltiff 2>&1 | grep -q _start
then
    echo "Unmet dependencies. g++, libjpeg and libtiff are required."
    exit 1
fi

# Ask user for destination path.
DST=""
while [ -z "$DST" ]
do
    echo -n "Website destination path: "
    read -e DST
    if [ ! -d "$DST" ] && [ -n "$DST" ]
    then
        echo "Error: '$DST' is not a directory."
        DST=""
    fi
    FILES=$(conflicting "$DST" .htaccess index.php backend frontend data favicon.ico)
    if [ -n "$FILES" ]
    then
        echo "Error: conflicting files in destination path:"
        echo "$FILES"
        echo "Please remove these files manually before installing."
        exit 1
    fi
done

# Link website.
echo "Linking website..."
if ! ln -st "$DST" "$PWD"/application/www/*
then
    echo "Error while linking website."
    exit 1
fi

# Set permissions.
echo "Setting permissions..."
if ! chmod -R 0755 application/www/data/
then
    echo "Error while setting permissions."
    exit 1
fi
mkdir application/www/data/cache
chmod 0755 application/www/data/cache

# Install first database version.
echo "Installing database..."
if ! sqlfile "application/sqlscripts/databases/db74.sql"
then
    echo "Installing base database failed."
    exit 1
fi

# Update database to current version.
setSetting db-version 74
setSetting maintenance-mode 1
setSetting updating 1
./update.sh
setSetting updating 0
setSetting maintenance-mode 0

# Build the tile builder.
echo "Building the tile builder..."
cd tilepyramidbuilder
if ! ./build.sh
then
    echo "Build failed."
    exit 1
fi
cd ..

# Install cronjob.
echo "Installing cronjob..."
CT=$(tempfile)
crontab -l 2>/dev/null > "$CT"
if ! grep -q "@reboot $PWD/tilepyramidbuilder/cronjob/cronjob.sh $PWD/application/www/backend/" "$CT"
then
    echo "@reboot $PWD/tilepyramidbuilder/cronjob/cronjob.sh $PWD/application/www/backend/" >> "$CT"
    if ! crontab "$CT"
    then
        echo "Crontab installation failed."
        exit 1
    fi
else
    echo "Crontab already present - not updated."
fi

# Start the cronjob - no need to reboot.
echo "Starting the tile builder..."
nohup $PWD/tilepyramidbuilder/cronjob/cronjob.sh $PWD/application/www/backend/ </dev/null >/dev/null 2>/dev/null &

