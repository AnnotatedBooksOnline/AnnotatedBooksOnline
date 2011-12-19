-- 
-- SQL for PostgreSQL. Database encoding must be UTF-8.
-- 

BEGIN TRANSACTION;

CREATE TABLE "Users"
(
    "userId" serial NOT NULL,
    "username" varchar(30) NOT NULL,
    "passwordHash" varchar(255) NOT NULL,
    "email" varchar(256) NOT NULL,
    "firstName" varchar(50),
    "lastName" varchar(50),
    "affiliation" varchar(50),
    "occupation" varchar(50),
    "website" varchar(255),
    "homeAddress" varchar(255),
    "active" bit(1) NOT NULL DEFAULT '0',
    "banned" bit(1) NOT NULL DEFAULT '0',
    "rank" smallint NOT NULL DEFAULT 10,
    "passwordRestoreToken" character(32),
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("userId"),
    UNIQUE ("username")
);

CREATE TABLE "PendingUsers"
(
    "pendingUserId" serial NOT NULL,
    "userId" integer NOT NULL,
    "confirmationCode" character(32) NOT NULL,
    "expirationDate" date NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("pendingUserId"),
    FOREIGN KEY ("userId")
        REFERENCES "Users",
    UNIQUE ("userId", "confirmationCode")
);

CREATE TABLE "BannedUsers"
(
    "banId" serial NOT NULL,
    "userId" integer NOT NULL,
    "description" text,
    "banEndDate" date,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("banId"),
    FOREIGN KEY ("userId")
        REFERENCES "Users"
);

CREATE TABLE "BannedIPAddresses"
(
    "ipAddress" bigint NOT NULL,
    "description" text,
    "banEndDate" date,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("ipAddress")
);

CREATE TABLE "Permissions"
(
    "permissionId" serial NOT NULL,
    "actionName" varchar(50) NOT NULL,
    "minRank" smallint NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("permissionId")
);

CREATE TABLE "Libraries"
(
    "libraryId" serial NOT NULL,
    "libraryName" varchar(50) NOT NULL,
    "libraryAddress" varchar(255),
    "website" varchar(255),
    "info" text,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("libraryId"),
    UNIQUE ("libraryName")
);

CREATE TABLE "Bindings"
(
    "bindingId" serial NOT NULL,
    "libraryId" integer NOT NULL,
    "signature" character(255) NOT NULL,
    "summary" text,
    "pagesToFirst" integer NOT NULL,
    "pagesFromLast" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("bindingId"),
    FOREIGN KEY ("libraryId")
        REFERENCES "Libraries",
    UNIQUE ("signature")
);

CREATE TABLE "BookLanguages"
(
    "bookLanguageId" serial NOT NULL,
    "bindingId" integer NOT NULL,
    "bookId" integer,
    "language" varchar(30) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("bookLanguageId"),
    FOREIGN KEY ("bindingId")
        REFERENCES "Bindings",
    UNIQUE ("bindingId", "language", "bookId")
);

CREATE TABLE "Books"
(
    "bookId" serial NOT NULL,
    "title" varchar(100) NOT NULL,
    "bindingId" integer NOT NULL,
    "minYear" smallint NOT NULL,
    "maxYear" smallint NOT NULL,
    "preciseDate" date,
    "placePublished" varchar(50),
    "publisher" varchar(50),
    "printVersion" integer,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("bookId"),
    FOREIGN KEY ("bindingId")
        REFERENCES "Bindings"
);

CREATE TABLE "TEIFiles"
(
    "teiFileId" serial NOT NULL,
    "bookId" integer,
    "bindingId" integer,
    "filename" varchar(255) NOT NULL,
    "contents" text NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("teiFileId"),
    FOREIGN KEY ("bookId")
        REFERENCES "Books"
        ON DELETE SET NULL,
    FOREIGN KEY ("bindingId")
        REFERENCES "Bindings"
        ON DELETE SET NULL
);

CREATE TABLE "Scans"
(
    "scanId" serial NOT NULL,
    "bookId" integer,
    "page" integer,
    "status" smallint NOT NULL DEFAULT 1,
    "width" integer NOT NULL,
    "height" integer NOT NULL,
    "zoomLevel" integer NOT NULL,
    "scanType" character(4) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("scanId"),
    FOREIGN KEY ("bookId")
        REFERENCES "Books",
        
    CHECK ("status" <> 0 OR (
                 "bookId"    IS NOT NULL 
             AND "page"      IS NOT NULL 
             AND "width"     IS NOT NULL 
             AND "height"    IS NOT NULL 
             AND "zoomLevel" IS NOT NULL
          )),
    CHECK ("scanType" = 'jpeg' OR "scanType" = 'tiff')
);

CREATE TABLE "Persons"
(
    "personId" serial NOT NULL,
    "name" varchar(60) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("personId")
);

CREATE TABLE "Authors"
(
    "personId" integer NOT NULL,
    "bookId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("personId", "bookId"),
    FOREIGN KEY ("personId")
        REFERENCES "Persons",
    FOREIGN KEY ("bookId")
        REFERENCES "Books"
);

CREATE TABLE "Provenances"
(
    "bindingId" integer NOT NULL,
    "personId" integer NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("bindingId", "personId"),
    FOREIGN KEY ("personId")
        REFERENCES "Persons",
    FOREIGN KEY ("bindingId")
        REFERENCES "Bindings"
);

CREATE TABLE "Annotations"
(
    "annotationID" serial NOT NULL,
    "bookID" integer NOT NULL,
    "page" integer NOT NULL,
    "polygon" bytea NOT NULL, -- See model for format description
    "transcriptionEng" text,
    "transcriptionOrig" text,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("annotationID"),
    FOREIGN KEY ("bookID")
        REFERENCES "Books"
);

CREATE TABLE "Settings"
(
    "settingName" varchar(100) NOT NULL,
    "settingValue" text,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("settingName")
);

CREATE TABLE "Uploads"
(
    "uploadId" serial NOT NULL,
    "userId" serial NOT NULL,
    "token" varchar(48) NOT NULL,
    "filename" varchar(255) NOT NULL,
    "size" integer NOT NULL,
    "timestamp" timestamp NOT NULL,
    "status" smallint NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("uploadId"),
    UNIQUE ("token"),
    FOREIGN KEY ("userId")
        REFERENCES "Users"
);

DROP AGGREGATE IF EXISTS array_accum (anyelement);
CREATE AGGREGATE array_accum (anyelement)
(
    sfunc = array_append,
    stype = anyarray,
    initcond = '{}'
);

COMMIT;
