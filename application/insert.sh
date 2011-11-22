#!/bin/bash

dbname="devtest postgres"
sqlfile=/tmp/temp_$(date +%s%N)
tilecommand=../application/tilepyramidbuilder/pyramid_builder

shopt -s nocasematch

echo -n "Enter binding summary: "
read summary
echo -n "Enter binding title: "
read bindTitle
echo -n "Enter book title: "
read bookTitle
echo -n "Enter min year: "
read minYear
echo -n "Enter max year: "
read maxYear
echo -n "Enter place published: "
read place
echo -n "Enter publisher: "
read publisher
echo 

echo -n "Enter author: "
read author

echo 'BEGIN TRANSACTION;' > $sqlfile

echo -n "Add new library? [Y/N]: "
read answer
if [[ "$answer" =~ [yY].* ]]
then
    echo -n "Enter library name: "
    read libName
    echo -n "Enter library description: "
    read libDesc
    echo "INSERT INTO \"Libraries\" (\"libraryName\", info) VALUES ('$libName', '$libDesc');" >> $sqlfile
    echo "INSERT INTO \"Bindings\" (\"libraryId\", signature, summary, \"pagesToFirst\", \"pagesFromLast\", title) VALUES ((SELECT MAX(\"libraryId\") FROM \"Libraries\"), 'NOSIGNATURE', '$summary', 0, 0, '$bindTitle');" >> $sqlfile
else
    psql -qt $dbname -c "SELECT \"libraryId\", \"libraryName\" FROM \"Libraries\";"
    echo -n "Enter library id: "
    read libId
    echo "INSERT INTO \"Bindings\" (\"libraryId\", signature, summary, \"pagesToFirst\", \"pagesFromLast\", title) VALUES ($libId, 'NOSIGNATURE_$(date +%s%N)', '$summary', 0, 0, '$title');" >> $sqlfile
fi

read -e -p "Enter scan location: " scanLocation
scanLocation="$(dirname $scanLocation)/$(basename $scanLocation)"

echo "INSERT INTO \"Persons\" (\"name\") VALUES ('$author');" >> $sqlfile
echo "INSERT INTO \"Books\" (\"bindingId\", \"minYear\", \"maxYear\", \"placePublished\", publisher, title) VALUES ((SELECT MAX(\"bindingId\") FROM \"Bindings\"), $minYear, $maxYear, '$place', '$publisher', '$bookTitle');" >> $sqlfile
echo "INSERT INTO \"Authors\" (\"authorId\", \"bookId\") VALUES ((SELECT MAX(\"personId\") FROM \"Persons\"), (SELECT MAX(\"bookId\") FROM \"Books\"));" >> $sqlfile

scanPage=0
for scan in $scanLocation/*
do
    scanPage=$(($scanPage+1))
    echo "INSERT INTO \"Scans\" (\"bookId\", \"page\", \"status\") VALUES ((SELECT MAX(\"bookId\") FROM \"Books\"), $scanPage, 0);" >> $sqlfile
done

echo "SELECT MAX(\"bookId\") FROM \"Books\";" >> $sqlfile
echo "COMMIT;" >> $sqlfile

bookId=$(cat $sqlfile | psql -Aqt $dbname)
rm $sqlfile

echo "Inserted book with id: $bookId"

scanPage=0
for scan in $scanLocation/*
do
    scanPage=$(($scanPage+1))
    scanId=$(psql -Aqt $dbname -c "SELECT \"scanId\" FROM \"Scans\" WHERE \"bookId\" = $bookId AND \"page\" = $scanPage;")
    echo Processing scan: $scanId
    mkdir $scanId
    $tilecommand -p $scanId -q 80 $scan
    psql -Aqt $dbname -c "UPDATE \"Scans\" SET \"status\" = 1 WHERE \"bookId\" = $bookId AND \"page\" = $scanPage;"
    chown apache:apache -R $scanId
done

echo Done.
