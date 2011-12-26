BEGIN TRANSACTION;

-- Change two inconsistent column names.
ALTER TABLE "Annotations" RENAME "annotationID"  TO "annotationId";
ALTER TABLE "Annotations" RENAME "bookID"  TO "bookId";


-- Adds shelves and bookmarks to the database.
CREATE TABLE "Shelves"
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
        REFERENCES "Users"
);

CREATE TABLE "ShelvedBooks"
(
    "bookId" integer NOT NULL,
    "shelfId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("bookId", "shelfId"),
    FOREIGN KEY ("bookId")
        REFERENCES "Books",
    FOREIGN KEY ("shelfId")
        REFERENCES "Shelves"
);

CREATE TABLE "Bookmarks"
(
    "userId" integer NOT NULL,
    "scanId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("userId", "scanId"),
    FOREIGN KEY ("userId")
        REFERENCES "Users",
    FOREIGN KEY ("scanId")
        REFERENCES "Scans"
);

COMMIT;
