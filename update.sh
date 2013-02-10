#!/bin/bash

. common.sh

# Get database version from database, or ask user if not found.
function getVersion
{
    CURRENTVERSION=$(getSetting "db-version")
    if ! is_number "$CURRENTVERSION"
    then
        echo "ERROR: Database version not found in database."
        local VERSION=$(dbUpdateVersion)
        echo "Assuming your installation directory correctly reflects your database, you database version is: $VERSION"
        while ! is_number "$CURRENTVERSION"
        do
            echo -n "Enter current (installed) database version: "
            read CURRENTVERSION
        done
        setSetting "db-version" $CURRENTVERSION
    fi
}

# Perform the upgrade.
function upgrade
{
    echo "Upgrading ..."
    
    getVersion
    NEWVERSION=$(dbUpdateVersion)

    if [ $CURRENTVERSION -lt $NEWVERSION ]
    then
    
        echo "Creating database backup before upgrade."
        backupDB
    
        echo "Performing database upgrade."
        for i in $(seq $(($CURRENTVERSION + 1)) $NEWVERSION)
        do
            if sqlfile "application/sqlscripts/updates/update$(($i - 1))_$i.sql"
            then
                echo "Database successfully upgraded from version $(($i - 1)) to version $i."
                setSetting "db-version" $i
            else
                echo "ERROR: database upgrade from version $(($i - 1)) to version $i failed."
                exit 1
            fi
        done
    fi
    
    # TODO: update scripts?
}

if [ ! "$(getSetting maintenance-mode)" = "1" ] && [ ! "$(getSetting updating)" = "1" ]
then
    echo "---------- ABO update utility ----------"
    echo
    echo "Use this utility to update the database properly."
    echo
    echo "1. Run this utility (you are doing this right now)."
    echo "2. Checkout the latest version into the ABO directory tree."
    echo "3. Run this utility again to finalize the update."
    echo
    echo "Updating will put ABO in update/maintenance mode during until the update is finalized."
    echo
elif [ "$(getSetting maintenance-mode)" = "1" ] && [ ! "$(getSetting updating)" = "1" ]
then
    yesno "ABO is already in maintenance mode. Continue anyhow?" || exit 1
elif [ "$(getSetting maintenance-mode)" = "1" ] && [ "$(getSetting updating)" = "1" ]
then
    upgrade
    setSetting updating 0
    setSetting maintenance-mode 0
    echo "Done. Updating was successful, ABO is no longer in update/maintenance mode."
    exit 0
fi

yesno "Update now?" || exit 1

setSetting maintenance-mode 1
setSetting updating 1

echo "Initialization is done. ABO is now in update/maintenance mode."
echo "Proceed by checking out the latest version into the ABO directory tree, then run this utility again to finalize the update."

exit 0
