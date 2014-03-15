CONFFILE=application/config/config.ini

function sql
{
    echo "$1" | mysql -u "$DBUSER" --password="$DBPASS" -B --skip-column-names "$DBNAME"
}

# Execute a SQL file, replacing USE directives with the proper database name.
function sqlfile
{
    cat $1 \
    | sed "s/^ *USE  *[^; ]\+/USE $DBNAME/" \
    | sed "s/^ *CREATE  *DATABASE  *[^;]\+;//" \
    | sed "s/##PREFIX##/${DBPREFIX}/g" \
    | mysql -u "$DBUSER" --password="$DBPASS"
}

# Get a setting from the database.
function getSetting
{
    sql "SELECT settingValue FROM ${DBPREFIX}Settings WHERE settingName = '$1';"
}

# Set a setting in the database.
function setSetting
{
    sql "REPLACE ${DBPREFIX}Settings (settingName, settingValue) VALUE ('$1', '$2');"
}

function backupDB
{
    mkdir -p dbbackup
    local FILE=$(date +dbbackup/%Y-%m-%d_%H-%M-%S.sql)
    echo "Writing database backup to $FILE"
    mysqldump -u "$DBUSER" --password="$DBPASS" -R -B "$DBNAME" > $FILE
}

# Read a configuration option.
function config
{
    if [ ! -e "$CONFFILE" ]
    then
        echo "Configuration file '$CONFFILE' not found." 1>&2
        exit 1
    fi
    grep "^ *$1 *=" "$CONFFILE" | cut -d '=' -f2- | sed 's/^ *//;s/ *$//;s/^"//;s/"$//'
}

# Check if input is numeric.
function is_number
{
    [[ "$1" =~ ^[0-9]+$ ]] && return 0
    return 1
}

# Ask a yes/no question.
function yesno
{
    local ANSWER=""
    while [[ ! "$ANSWER" =~ ^[yYnN]$ ]]
    do
        echo -n "$1 [y/n] "
        read ANSWER
    done
    [[ "$ANSWER" =~ ^[yY]$ ]] && return 0
    return 1
}

function conflicting
{
    local C=""
    DIR=$1
    shift
    for i in $@
    do
        if [ -e "$DIR/$i" ]
        then
            C="$C $i"
        fi
    done
    echo -n $C
}

# Get latest database update script version.
function dbUpdateVersion
{
    echo application/sqlscripts/updates/update*_*.sql | sed 's/ *[a-z/]*update[0-9]\+_\([0-9]\+\).sql */\1\n/g' | sort -g | tail -n1
}

DBUSER="$(config database-username)"
DBPASS="$(config database-password)"
DBPREFIX="$(config database-prefix)"
DBNAME="$(config database-dsn | sed 's/.*dbname=\([^;]\+\).*/\1/')"

# Verify database info.
if [ -z "$DBUSER" ]
then
    echo "ERROR: Database user not configured. Exiting."
    exit 1
fi
if [ -z "$DBPASS" ]
then
    echo "ERROR: Database password not configured. Exiting."
    exit 1
fi
if [ -z "$DBNAME" ]
then
    echo "ERROR: Database name not configured. Exiting."
    exit 1
fi
if [ -z "$DBPREFIX" ]
then
    echo "WARNING: Using empty database table prefix."
fi
if ! ERR=$(mysql -B -u "$DBUSER" --password="$DBPASS" </dev/null 2>&1)
then
    echo "ERROR: Error while trying database credentials:"
    echo $ERR
    exit 1
fi

