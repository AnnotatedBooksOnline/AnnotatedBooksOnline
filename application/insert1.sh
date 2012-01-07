#
# Script for adding uploads to the database that already exist on the server
#

DATABASE="devtest"

sqlfile=/tmp/temp_$(date +%s%N)

echo -n "Enter user name: "
read userName
userId=$(psql -Aqt $DATABASE postgres -c "SELECT \"userId\" FROM \"Users\" WHERE \"username\" = '$userName'")
echo $userId;

echo -n "Scan location: "
read scanLocation

echo 'BEGIN TRANSACTION;' > $sqlfile

for scan in $scanLocation/*
do
   echo "INSERT INTO \"Uploads\" (\"userId\", \"token\", \"status\", \"filename\", \"size\", \"timestamp\") VALUES ($userId, '/tmplink/$scan', 0, '', 0, current_timestamp);" >> $sqlfile
done

echo "COMMIT;" >> $sqlfile

psql $DATABASE postgres < $sqlfile
