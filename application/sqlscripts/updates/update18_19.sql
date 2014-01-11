BEGIN TRANSACTION;

-- Change two inconsistent column names.
ALTER TABLE "##PREFIX##Annotations" RENAME "annotationID"  TO "annotationId";
ALTER TABLE "##PREFIX##Annotations" RENAME "bookID"  TO "bookId";


-- Adds shelves and bookmarks to the database.
CREATE TABLE "##PREFIX##Shelves"
(
    "shelfId" serial NOT NULL,
    "userId" integer NOT NULL,
    "shelfName" varchar(40) NOT NULL,
    "special" bit NOT NULL DEFAULT '0',
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("shelfId"),
    FOREIGN KEY ("userId") 
        REFERENCES "##PREFIX##Users"
);

CREATE TABLE "##PREFIX##ShelvedBooks"
(
    "bookId" integer NOT NULL,
    "shelfId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("bookId", "shelfId"),
    FOREIGN KEY ("bookId")
        REFERENCES "##PREFIX##Books",
    FOREIGN KEY ("shelfId")
        REFERENCES "##PREFIX##Shelves"
);

CREATE TABLE "##PREFIX##Bookmarks"
(
    "userId" integer NOT NULL,
    "scanId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("userId", "scanId"),
    FOREIGN KEY ("userId")
        REFERENCES "##PREFIX##Users",
    FOREIGN KEY ("scanId")
        REFERENCES "##PREFIX##Scans"
);

COMMIT;
