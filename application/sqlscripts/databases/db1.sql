-- 
-- SQL for PostgreSQL. Database encoding must be UTF-8.
-- 

CREATE TABLE "Users"
(
    "userId" serial NOT NULL,
    "username" varchar(30) NOT NULL,
    "passwordHash" character(40) NOT NULL,
    "email" varchar(255) NOT NULL,
    "firstName" varchar(50),
    "lastName" varchar(50),
    "affiliation" varchar(50),
    "occupation" varchar(50),
    "website" varchar(255),
    "homeAddress" varchar(255),
    "active" bit(1) NOT NULL,
    "banned" bit(1) NOT NULL,
    "rank" smallint NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("userId"),
    UNIQUE ("username")
);

CREATE TABLE "PendingUsers"
(
    "userId" serial NOT NULL,
    "confirmationCode" character(20) NOT NULL,
    "expirationDate" date NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("userId"),
    FOREIGN KEY ("userId")
        REFERENCES "Users",
    UNIQUE ("confirmationCode")
);

CREATE TABLE "BannedUsers"
(
    "banId" serial NOT NULL,
    "userId" serial NOT NULL,
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
    "libraryId" serial NOT NULL,
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
    "bindingId" serial NOT NULL,
    "bookId" serial NOT NULL,
    "language" varchar(30) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("bindingId", "bookId", "language"),
    FOREIGN KEY ("bindingId")
        REFERENCES "Bindings"
);

CREATE TABLE "Books"
(
    "bookId" serial NOT NULL,
    "bindingId" serial NOT NULL,
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
    "bookId" serial NOT NULL,
    "bindingId" serial NOT NULL,
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
    "bookId" serial NOT NULL,
    "page" integer NOT NULL,
    "status" smallint NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("scanId"),
    FOREIGN KEY ("bookId")
        REFERENCES "Books"
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
    "authorId" serial NOT NULL,
    "bookId" serial NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("authorId", "bookId),
    FOREIGN KEY ("authorId")
        REFERENCES "Persons",
    FOREIGN KEY ("bookId")
        REFERENCES "Books"
);

CREATE TABLE "Provenances"
(
    "bindingId" serial NOT NULL,
    "personId" serial NOT NULL,
    
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
