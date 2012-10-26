SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

CREATE DATABASE abo CHARACTER SET 'utf8' COLLATE 'utf8_unicode_ci';

USE abo;

CREATE TABLE "Permissions" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),
    
    "actionName" character varying(50) NOT NULL,
    "minRank" smallint NOT NULL,
    
    PRIMARY KEY ("actionName")
);

CREATE TABLE "Settings" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "settingName" character varying(100) NOT NULL,
    visible boolean DEFAULT 0 NOT NULL,
    "settingValue" text,
    
    PRIMARY KEY ("settingName")
);

CREATE TABLE "Languages" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "languageId" integer NOT NULL AUTO_INCREMENT,
    "languageName" character varying(30) NOT NULL,
    
    PRIMARY KEY ("languageId"),
    UNIQUE ("languageName")
);

CREATE TABLE "Libraries" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "libraryId" integer NOT NULL AUTO_INCREMENT,
    "libraryName" character varying(50) NOT NULL,
    "libraryAddress" character varying(255),
    website character varying(255),
    info text,
    
    PRIMARY KEY ("libraryId"),
    UNIQUE ("libraryName")
);

CREATE TABLE "HelpPages" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "helpPageId" integer NOT NULL AUTO_INCREMENT,
    "pageName" character varying(30) NOT NULL,
    "helpType" character varying(30),
    
    PRIMARY KEY ("helpPageId"),
    UNIQUE ("pageName")
);

CREATE TABLE "Persons" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "personId" integer NOT NULL AUTO_INCREMENT,
    name character varying(60) NOT NULL,
    
    PRIMARY KEY ("personId")
);

CREATE TABLE "Users" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "userId" integer NOT NULL AUTO_INCREMENT,
    username character varying(30) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    email character varying(256) NOT NULL,
    "firstName" character varying(50),
    "lastName" character varying(50),
    affiliation character varying(50),
    occupation character varying(50),
    website character varying(255),
    "homeAddress" character varying(255),
    banned boolean DEFAULT 0 NOT NULL,
    rank smallint DEFAULT 10 NOT NULL,
    "passwordRestoreToken" character(32),
    "activationStage" smallint NOT NULL,
    "registrationDate" date NOT NULL,
    "lastActive" timestamp,
    
    PRIMARY KEY ("userId"),
    UNIQUE (username)
);

CREATE TABLE "HelpParagraphs" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "helpParagraphId" integer NOT NULL AUTO_INCREMENT,
    "helpPageId" integer NOT NULL,
    "paragraphParentId" integer,
    "actionName" character varying(50),
    title character varying(50) NOT NULL,
    "settingName" character varying(100),
    
    PRIMARY KEY ("helpParagraphId"),
    UNIQUE ("helpPageId", "paragraphParentId", title),
    FOREIGN KEY ("actionName") REFERENCES "Permissions"("actionName"),
    FOREIGN KEY ("helpPageId") REFERENCES "HelpPages"("helpPageId"),
    FOREIGN KEY ("paragraphParentId") REFERENCES "HelpParagraphs"("helpParagraphId"),
    FOREIGN KEY ("settingName") REFERENCES "Settings"("settingName")
);

CREATE TABLE "HelpContents" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "helpContentId" integer NOT NULL AUTO_INCREMENT,
    "helpParagraphId" integer NOT NULL,
    "settingValue" text,
    content text NOT NULL,
    
    PRIMARY KEY ("helpContentId"),
    UNIQUE ("helpParagraphId", "settingValue"(255)), -- Guarantees uniqueness on the first 255 characters
    FOREIGN KEY ("helpParagraphId") REFERENCES "HelpParagraphs"("helpParagraphId")
);

CREATE TABLE "Bindings" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bindingId" integer NOT NULL AUTO_INCREMENT,
    "libraryId" integer NOT NULL,
    signature character varying(255) NOT NULL,
    summary text,
    title character varying(100),
    status smallint DEFAULT 0 NOT NULL,
    "userId" integer,
    
    PRIMARY KEY ("bindingId"),
    UNIQUE (signature, "libraryId"),
    FOREIGN KEY ("libraryId") REFERENCES "Libraries"("libraryId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

CREATE TABLE "Books" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bookId" integer NOT NULL AUTO_INCREMENT,
    "bindingId" integer NOT NULL,
    "minYear" smallint NOT NULL,
    "maxYear" smallint NOT NULL,
    "preciseDate" date,
    "placePublished" character varying(50),
    publisher character varying(50),
    "printVersion" character varying(30),
    title character varying(100) NOT NULL,
    "firstPage" integer,
    "lastPage" integer,
    
    PRIMARY KEY ("bookId"),
    FOREIGN KEY ("bindingId") REFERENCES "Bindings"("bindingId")
);

CREATE TABLE "Uploads" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "uploadId" integer NOT NULL AUTO_INCREMENT,
    "userId" integer NOT NULL,
    token character varying(48) NOT NULL,
    filename character varying(255) NOT NULL,
    size integer NOT NULL,
    "timestamp" timestamp NOT NULL,
    status smallint NOT NULL,
    
    PRIMARY KEY ("uploadId"),
    UNIQUE (token),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId")
);

CREATE TABLE "Scans" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "scanId" integer NOT NULL AUTO_INCREMENT,
    page integer,
    status smallint DEFAULT 1 NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    "zoomLevel" integer NOT NULL,
    "scanType" character(4) NOT NULL,
    "bindingId" integer,
    "uploadId" integer,
    "scanName" character varying(255),
    
    PRIMARY KEY ("scanId"),
    FOREIGN KEY ("bindingId") REFERENCES "Bindings"("bindingId"),
    FOREIGN KEY ("uploadId") REFERENCES "Uploads"("uploadId"),
    CHECK (((("scanType" = 'jpeg') OR ("scanType" = 'tiff')) OR ("scanType" = '')))
);

CREATE TABLE "Annotations" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "annotationId" integer NOT NULL AUTO_INCREMENT,
    "transcriptionEng" text NOT NULL,
    "transcriptionOrig" text NOT NULL,
    "scanId" integer NOT NULL,
    "createdUserId" integer NOT NULL,
    "timeCreated" timestamp NOT NULL,
    "order" integer NOT NULL,
    polygon text NOT NULL,
    "changedUserId" integer NOT NULL,
    "timeChanged" timestamp NOT NULL,
    
    PRIMARY KEY ("annotationId"),
    FOREIGN KEY ("changedUserId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("createdUserId") REFERENCES "Users"("userId"),
    FOREIGN KEY ("scanId") REFERENCES "Scans"("scanId")
);

CREATE TABLE "Authors" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "personId" integer NOT NULL,
    "bookId" integer NOT NULL,
    
    PRIMARY KEY ("personId", "bookId"),
    FOREIGN KEY ("personId") REFERENCES "Persons"("personId"),
    FOREIGN KEY ("bookId") REFERENCES "Books"("bookId")
);

CREATE TABLE "BindingLanguages" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bindingId" integer NOT NULL,
    "languageId" integer NOT NULL,
    
    PRIMARY KEY ("bindingId", "languageId"),
    FOREIGN KEY ("bindingId") REFERENCES "Bindings"("bindingId"),
    FOREIGN KEY ("languageId") REFERENCES "Languages"("languageId")
);

CREATE TABLE "BookLanguages" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bookId" integer NOT NULL,
    "languageId" integer NOT NULL,
    
    PRIMARY KEY ("bookId", "languageId"),
    FOREIGN KEY ("bookId") REFERENCES "Books"("bookId"),
    FOREIGN KEY ("languageId") REFERENCES "Languages"("languageId")
);

CREATE TABLE "Bookmarks" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "userId" integer NOT NULL,
    "scanId" integer NOT NULL,
    
    PRIMARY KEY ("userId", "scanId"),
    FOREIGN KEY ("scanId") REFERENCES "Scans"("scanId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE TABLE "Notes" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "userId" integer NOT NULL,
    text text,
    
    PRIMARY KEY ("userId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE TABLE "PendingUsers" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "pendingUserId" integer NOT NULL AUTO_INCREMENT,
    "userId" integer NOT NULL,
    "confirmationCode" character(32) NOT NULL,
    "expirationDate" date NOT NULL,
    
    PRIMARY KEY ("pendingUserId"),
    UNIQUE ("confirmationCode"),
    UNIQUE ("userId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE TABLE "Provenances" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bindingId" integer NOT NULL,
    "personId" integer NOT NULL,
    
    PRIMARY KEY ("bindingId", "personId"),
    FOREIGN KEY ("bindingId") REFERENCES "Bindings"("bindingId"),
    FOREIGN KEY ("personId") REFERENCES "Persons"("personId")
);

CREATE TABLE "Shelves" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "shelfId" integer NOT NULL AUTO_INCREMENT,
    "userId" integer NOT NULL,
    "shelfName" character varying(40) NOT NULL,
    special boolean DEFAULT 0 NOT NULL,
    "parentShelfId" integer,
    "position" integer DEFAULT 0,
    
    PRIMARY KEY ("shelfId"),
    FOREIGN KEY ("parentShelfId") REFERENCES "Shelves"("shelfId"),
    FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE TABLE "ShelvedBooks" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "bookId" integer NOT NULL,
    "shelfId" integer NOT NULL,
    
    PRIMARY KEY ("bookId", "shelfId"),
    FOREIGN KEY ("bookId") REFERENCES "Books"("bookId"),
    FOREIGN KEY ("shelfId") REFERENCES "Shelves"("shelfId")
);

CREATE TABLE "TEIFiles" (
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),

    "teiFileId" integer NOT NULL AUTO_INCREMENT,
    "bookId" integer,
    "bindingId" integer,
    filename character varying(255) NOT NULL,
    contents text NOT NULL,
    
    PRIMARY KEY ("teiFileId"),
    UNIQUE ("bookId", "bindingId"),
    FOREIGN KEY ("bindingId") REFERENCES "Bindings"("bindingId") ON DELETE SET NULL,
    FOREIGN KEY ("bookId") REFERENCES "Books"("bookId") ON DELETE SET NULL
);

INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('view-pages', 0, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('search-books', 0, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('add-annotations', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('edit-annotations', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('upload-bindings', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('manage-bookshelf', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('manage-notebook', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('export-books', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('view-history', 40, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('revert-changes', 40, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('change-book-info', 40, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('accept-registrations', 50, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('ban-users', 50, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('change-user-roles', 50, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('change-global-settings', 50, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('delete-users', 50, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('view-users-part', 10, NULL, NULL, NULL, NULL);
INSERT INTO "Permissions" ("actionName", "minRank", "createdOn", "createdBy", "changedOn", "changedBy") VALUES ('view-users-complete', 50, NULL, NULL, NULL, NULL);

INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (2, 'Notes', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (3, 'Register', NULL, NULL, NULL, NULL, 'register');
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (4, 'Search', NULL, NULL, NULL, NULL, 'search');
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (5, 'Userlist', NULL, NULL, NULL, NULL, 'users');
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (6, 'Viewer', NULL, NULL, NULL, NULL, 'binding');
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (7, 'Welcome', NULL, NULL, NULL, NULL, 'welcome');
INSERT INTO "HelpPages" ("helpPageId", "pageName", "createdOn", "createdBy", "changedOn", "changedBy", "helpType") VALUES (8, 'Upload', NULL, NULL, NULL, NULL, 'upload');

INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (2, 2, NULL, 'manage-notebook', 'Introduction', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (3, 2, NULL, 'manage-notebook', 'Adding / removing notes', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (4, 2, NULL, 'manage-notebook', 'Saving notes', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (6, 3, NULL, NULL, 'Finalizing your registration', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (7, 4, NULL, NULL, 'Introduction', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (8, 4, NULL, NULL, 'Sorting options', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (9, 4, NULL, NULL, 'Result options', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (10, 4, NULL, NULL, 'Advanced search query notations', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (11, 5, NULL, 'view-users-part', 'Userlist', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (13, 6, NULL, NULL, 'Basic viewer functionalities', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (1, 7, NULL, NULL, 'Edit profile', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (19, 6, NULL, NULL, 'Go to another page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (18, 6, 13, NULL, 'Reset the view', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (27, 6, NULL, NULL, 'Link to a page, book or binding', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (28, 7, NULL, NULL, 'Introduction', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (29, 7, NULL, NULL, 'Buttons', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (30, 7, NULL, NULL, 'Login / logout', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (31, 7, NULL, 'change-global-settings', 'Admin help page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (5, 3, NULL, NULL, 'Introduction', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (14, 6, 13, NULL, 'Zoom in', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (15, 6, 13, NULL, 'Zoom out', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (16, 6, 13, NULL, 'Move across page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (17, 6, 13, NULL, 'Rotate', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (20, 6, 19, NULL, 'Previous page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (21, 6, 19, NULL, 'Next page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (22, 6, 19, NULL, 'First page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (23, 6, 19, NULL, 'Start of a book', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (24, 6, 19, NULL, 'Last page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (25, 6, 19, NULL, 'Certain page number', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (26, 6, 19, NULL, 'Select a page', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (12, 6, NULL, NULL, 'Introduction', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (32, 8, NULL, 'upload-bindings', 'About uploading', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (33, 8, NULL, 'upload-bindings', 'Uploading books', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (34, 8, NULL, 'upload-bindings', 'Binding information', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (35, 8, NULL, 'upload-bindings', 'Book information', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (36, 6, NULL, NULL, 'Annotations', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (37, 6, 36, NULL, 'Read transcriptions of annotations', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (38, 6, 36, 'edit-annotations', 'Add and Edit transcriptions', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (39, 6, 36, 'add-annotations', 'Add transcription', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (40, 6, 36, 'edit-annotations', 'Add and edit text', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (41, 6, 36, 'edit-annotations', 'Edit polygon', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "HelpParagraphs" ("helpParagraphId", "helpPageId", "paragraphParentId", "actionName", title, "createdOn", "createdBy", "changedOn", "changedBy", "settingName") VALUES (42, 6, 36, 'edit-annotations', 'Delete a transcription', NULL, NULL, NULL, NULL, NULL);

INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (1, 2, NULL, '<p>
    The notes functionality in this website allows users to keep personal notes on things like important details, references, ideas or quotes, without having to select a text editor. Not having to change programs means that the text in the browser will not be obscured, as often happens on small screens or at lower resolutions.
</p>

<p>
    The notes are available on various pages on the website and can be found in the Workspace sidebar, on the right side of the screen. The notes are personal, which means that nobody but you can read them, and you can''t read other users'' notes. The text is synchronized between all pages: any changes in the notes section on one page will also be made in the notes on all other pages. It is the real life equivalent of a single notebook on a desk next to a pile of books: no matter what book you open on one side, it will still have the single notebook next to it, unchanged.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (2, 3, NULL, '<p>
Adding notes is easy: simply click in the notes section and start typing. It works just like any other text field and supports features such as:
</p>

<ul>
    <li><b>Selecting</b></li>
    <li><b>Cut / Copy / Paste:</b> (Ctrl+X / Ctrl+C / Ctrl+V) [(Cmd+... on Mac?)]</li>
    <li><b>Moving text:</b> (select text, then left-click on the selected text and drag it to the desired position)</li>
    <li><b>Undo / Redo:</b> (Ctrl+Z / Ctrl+Y) [CHECK IF WORKS ON ALL BROWSERS / EVERY OS (Cmd+Z on Mac?)]</li>
    <li><b>Linebreaks / empty lines</b></li>
</ul>

<p>
    Some browsers have built-in spellchecking support, which (if enabled) should also work on the notes. If you wish to use this functionality, please refer to the help function of your browser to find out more.
</p>

<p>
    Keep in mind that if you add or remove anything, the changes are applied to all the pages, not just the one you are currently viewing!
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (3, 4, NULL, '<p>
    The latest version of your notes are saved in the system, and will still be there next time you log in. However, it is not designed to be the safest place for all your notes. It is only meant to keep your notes visible and in reach for easy access. It is always a good idea to back up any important notes you might write frequently to a local (or online) document. Then, if something goes wrong unexpectedly and the notes are lost, you will still have access to them.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (4, 6, NULL, '<p>
    You will receive an email at the address you entered, containing a confirmation link. Please follow the link to finalize your registration. You should now be able to log in, and have access to all the features of the website.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (5, 7, NULL, '<p>
    You can search for books by selecting what you want to limit your search to (''Author'', ''Title'', etc. or simply ''Any'') and then simply entering the search query in the textfield.
</p>

<p>
    You can add more criteria to the search by changing the ''- Select -'' dropdown box to anything else. Another line will automatically be added below.
</p>

<p>
    Removing lines is just as easy: simply either change the a dropdown box back to ''- Select -'', or press the button with the red cross on the right side of a line to remove that line.
</p>

<p>
    After setting the search criteria, simply press ''Search'' (below the search criteria) to get a list of results. If the search results are not what the user was looking for, the query can be changed and a new list of results will be generated after pressing ''Search'' again.
</p>

<p>
    For more advanced search options, please see the list of **Advanced search query notations**.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (8, 10, NULL, '<p>
    TODO
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (9, 11, NULL, '<p>
    Logged in users can see the list of registered users by pressing the ''Users'' button. Here, you can see the public information of all the users, for example in case you want to check the correct spelling of a user''s name, or need to contact them.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (17, 30, NULL, '<ul>
    <li><b>Login:</b> To log in, first you need to **Register**. Once you have finished registration, simply press the button saying ''Login'', enter your username and password, and press ''Login''.</li>
    <li><b>Logout:</b> To log out, simply press the ''Logout'' button, which replaces the ''Log in'' button while you are logged in.</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (18, 31, NULL, '<p>
    There is also an explanation for admins, available on **Admin**.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (19, 5, NULL, '<p>
    After pressing the ''Register'' button, you will see a list of fields to fill out. All fields with a * after the description are mandatory. Some notes:
</p>

<ul>
    <li><b>Username:</b> You should enter a username of at least 6 characters. It can only contain numbers, uppercase and lowercase letters, spaces, and any of the following characters: _ . '' @ </li>
    <li><b>Email address:</b> This should be a valid email address, because a confirmation mail will be sent here.</li>
    <li><b>Password:</b> This needs to be at least 8 characters long. Please always make sure you choose a secure password, preferably something not easily guessed by others but easy to remember.</li>
</ul>

<p>
    After reading and accepting the ''<a href="#termsofuse" title="Open terms of use">terms of use</a>'', please check the checkbox and press the ''Register'' button at the bottom of the page.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (27, 23, NULL, '<p>
    You can go to the first page of a book through the book informatiion box.
</p>
<ul>
    <li>Open the book information box in the information sidebar to the left.</li>
    <li>Click on the page number displayed beneath the title of the book you want to go to.</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (36, 36, NULL, '', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (24, 20, NULL, '<p>
    To go to the previous page:
</p>
<ul>
    <li>Click the previous page button in the buttons bar.</li>
</ul>
<p>
    The button is to the left of the textfield displaying the current page number. This function is only available if there is a previous page to go to.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (37, 42, NULL, '<p>
    To delete transcriptions, you must be in the edit mode.
</p>
<p>
    You can delete an annotation marker and all transcriptions added to it.
</p>
<ol>
    <li>Select the erasor tool, on the right of the buttons bar</li>
    <li>Click the annotation of which you want to delete all transcriptions</li>
</ol>
<p>
    To make the delete permanent, you must save by clicking the ''save button'' in the annotations tab. You can also undo the deletion by clicking the ''reset'' button.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (38, 41, NULL, '<p>
    To edit polygons, you must be in the edit mode.
</p>
<p>
    The wireframe surrounding an annotation is a polygon. You can move, add and delete points of a polygon. 
</p>
<ul>
    <li>
        <p>
            <b>Move point</b>
        </p>
        <p>
            Select the ''move a vertex'' tool from the buttons list, it is located next to the rectangle tool.
        </p>
        <p>
            You can now grab and drag points of polygons.
        </p>
    </li>
    <li>
        <p>
            <b>Add point</b>
        </p>
        <p>
            Select the ''add a vertex'' tool from the buttons list, it is located next to the ''move a vertex'' tool.
        </p>
        <p>
            Click inside a polygon to add a point to it. To add a point outside the current boundery of a polygon, move the added point to the desired location.
        </p>
    </li>
    <li>
        <p>
            <b>Delete point</b>
        </p>
            Select the ''erase a vertex'' tool from the buttons list, it is located next to the ''add a vertex'' tool.
        <p>
            Click the point you want to remove.
        </p>
        <p>
        </p>
    </li>
</ul>
<p>
    To save the changes, click the ''save'' button in the annotations tab.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (39, 40, NULL, '<p>
    To add transcriptions, you must be in the edit mode.
</p>
<p>
    To make a transcription, you must first mark the annotation you are transcribing. This can be done in two ways:
</p>
<ol>
    <li>
        <p>
            <b>Polygon tool</b>
        </p>
        <p>
            The polygon tool is next to the drag tool on the buttons bar. Click to place a point on the page. Every next point you place, will be connected to the last point, forming a wireframe. To close the shape, either double click, or rightclick with the mouse.
        </p>
    </li>
    <li><p>
            <b>Rectangle tool</b>
        </p>
        <p>
            The rectangle tool is next to the polygon tool on the buttons bar. Click and drag to make a rectangle polygon.
        </p>
    </li>
</ol>
<p>
    If the wireframe needs more working, you can also **edit the polygon||Viewer/Add and edit transcriptions/Edit polygon**
</p>
<p>
    After completing the wireframe, a new annotation is added to the list in the annotations tab. Now, a **transcription can be added||Viewer/Add and edit transcriptions/Add and edit text** to the annotation.
</p>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>

Add and edit text
<p>
    To edit transcriptions, you must be in the edit mode.
</p>
<p>
    To add or edit the transcription of an annotation:
</p>
<ol>
    <li>Click the edit button next to the annotation in the annotations list, found in the annotations tab.</li>
    <li>Enter the transcription(s) in the textboxes in the popup</li>
    <li>Click on done</li>
</ol>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (40, 39, NULL, '<p>
    To add transcriptions, you must be in the edit mode.
</p>
<p>
    To make a transcription, you must first mark the annotation you are transcribing. This can be done in two ways:
</p>
<ol>
    <li>
        <p>
            <b>Polygon tool</b>
        </p>
        <p>
            The polygon tool is next to the drag tool on the buttons bar. Click to place a point on the page. Every next point you place, will be connected to the last point, forming a wireframe. To close the shape, either double click, or rightclick with the mouse.
        </p>
    </li>
    <li><p>
            <b>Rectangle tool</b>
        </p>
        <p>
            The rectangle tool is next to the polygon tool on the buttons bar. Click and drag to make a rectangle polygon.
        </p>
    </li>
</ol>
<p>
    If the wireframe needs more working, you can also **edit the polygon||Viewer/Add and edit transcriptions/Edit polygon**
</p>
<p>
    After completing the wireframe, a new annotation is added to the list in the annotations tab. Now, a **transcription can be added||Viewer/Add and edit transcriptions/Add and edit text** to the annotation.
</p>
<p>
    To save your work, click the ''save'' button in the annotations tab.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (41, 37, NULL, '<p>
    Users can mark annotations on the page and add transcriptions to them. A marked annotation has a wireframe surrounding it, which will light up when the mouse is moved over it.
</p>
<p>
    The transcription of a selected annotation can be viewed in the annotations tab, in the workspace on the right of the screen. An annotation can be selected in two ways:
</p>
<ol>
    <li>Click on the annotation on the page.</li>
    <li>Select the annotation from the list in the annotations tab.</li>
</ol>
<p>
    Transcriptions can be made in two languages, the orriginal and English. With the dropdown box in the right corner of the annotations tab, the language for the transcriptions can be selected. However, an annotation does not always have a transcription, or only have it one of the two languages.
</p>
<p>
    <b>Note:</b> Every anotation has a creation date and a last edited date. These can also be viewed in the annotations tab.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (42, 38, NULL, '<p>
    To add or edit transcriptions, enter edit mode by clicking the ''edit mode'' button in the annotations tab.
</p>
<p>
    A set of new functions becomes availeble on the buttons bar at the top of the viewer. Click the ''view mode'' button in the annotations tab to return to the viewing mode.
</p>
<p>
    What do you want to do?
</p>
<ul>
    <li>**Add a transcription||Viewer/Add and edit transcriptions/Add transcription**</li>
    <li>**Edit text||Viewer/Add and edit transcriptions/Add and edit text**</li>
    <li>**Edit wireframe||Viewer/Add and edit transcriptions/Edit polygon**</li>
    <li>**Delete a transcription||Viewer/Add and edit transcriptions/Delete a transcription**</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (6, 8, NULL, '<p>
    To sort the list of results, there is a set of dropdown boxes in the Advanced options sidebar on the left side of the screen. To sort the list by one attribute, simply select it in the first dropdown box, and the list should be automatically sorted. If further sorting within this already sorted list is required, select another attribute in the second dropdown box. If necessary, a third can also be added.
</p>

<p>
    If you want to invert the sorting, for instance from Z to A or 999 to 1, simply check the checkbox to the right of the sorting you want to invert. The other sorting criteria will be unaffected.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (7, 9, NULL, '<p>
    To change what attributes of the books in the list of search results are shown, go to the ''Result options'' in the Advanced options sidebar on the left side of the screen, below the ''**Sorting options||Search/Sorting options**''. To show or hide the attributes, simply check or uncheck the checkbox in front of the corresponding attribute name.
</p>

<p>
    In this menu you can also change how many results are shown per page: simply select the preferred amount in the dropdown box.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (32, 32, NULL, '<p>
    As is to be expected, adding material to this website requires you to understand and agree with the terms and conditions. In particular, it is not allowed to upload scans if you do not have the permission to do so. Also, it is required that the scans have a high enough quality. The rules and specifics of uploading are detailed on the page that is shown when you press the ''Upload'' button at the top of the screen.

    After you have read the rules and agree with them, press ''Continue'' to progress to the actual uploading screen.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (33, 33, NULL, '<p>
    Uploading books is done by selecting the scans of the books, entering the **information of the binding**, and finally entering the **information of any books** that might be contained within the binding.

    Uploading scans is done by pressing the ''Select scans'' button and selecting all the scan files (.tiff and .jpg are supported). The scans will automatically start uploading, and will be processed for viewing while you fill out the rest of the form below. If you need to add more scans, simply press the ''Select scans'' button again. Any scans you select will be added to the list of scans already uploading.

    If the selected scans are wrong, press the red cross behind the wrong scans to cancel that upload, or simply press the ''Clear scans'' button to cancel the upload of all scans. You can then select new scans to upload if necessary.

    Should you for some reason need to remove even the information contained within the forms instead of only the scans, simply press the ''Reset'' button at the bottom of the page. This will clear all fields and reset it to its default state so you can start over. Please take note that you can not undo this.

    Finally, once everything is done, press ''Continue'' to finalize the uploading process.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (34, 34, NULL, '<p>
    As the scans are uploading and being processed by the system, you can fill out the binding information. The binding is the encompassing whole around any books that might be contained within, be it one or multiple. This part of the form contains the following fields:
<ul>
    <li><b>Library:</b> the library in which the binding that is the source of the scans can be found. This is a mandatory field.</li>
    <li><b>Shelfmark:</b> the shelfmark of the binding in its current location. This is a mandatory field.</li>
    <li><b>Readers:</b> the people who have read or owned the book, and possibly made the annotations within.</li>
    <li><b>Languages of annotations:</b> the languages in which the annotations are written. Simply open the dropdown box by clicking on it, (de)select the correct languages by clicking on them, then click outside the dropdown box to close it.</li>
</ul>
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (35, 35, NULL, '<p>
    If a binding contains one book, simply fill out the form as described below. If it contains multiple works bound together in a single binding, press the ''Add book'' button at the bottom until there are enough forms for every book. Press ''Delete book'' below the form you want to remove if you added too many. Make sure you do not remove the valid ones, or you will have to fill out the form again. If you are not sure, looking at the lines around the forms may help as a guideline to find out what button belongs with what form.

    The following fields are shown for every book:
<ul>
    <li><b>Title:</b> the title of the book. This is a mandatory field.</li>
    <li><b>Author:</b> the author of the book, if known.</li>
    <li><b>Time period of publication:</b> the time period of publication, approximated if necessary. This is a mandatory field.</li>
    <li><b>Place published:</b> the location where the book was published.</li>
    <li><b>Languages:</b> the language(s) in which this book was written. This is a mandatory field.</li>
    <li><b>Version:</b> if the book has a version indication, please add it here.</li>
    <li><b>Publisher/printer:</b> the publisher or printer that manufactured this copy of the book.</li>
</ul>
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (31, 12, NULL, '<p>
    The viewer is used to view scans, read and add transcriptions and download the books for study offline.
</p>

<p>
    What do you want to do?
</p>
<ul>
    <li>**Zoom, move or rotate a page||Viewer/Basic viewer functionalities**</li>
    <li>**Go to another page||Viewer/Go to another page**</li>
    <li>**View information about a binding||Viewer/View information about a binding**</li>
    <li>**Link to a page, book or binding||Link to a page, book or binding**</li>
    <li>**Export to pdf||Viewer/Export to pdf** </li>
    <li>**Read transcriptions of annotations||Viewer/Read transcriptions of annotations**</li>
    <li>**Add and edit transcriptions||Viewer/Add and edit transcriptions**</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (10, 13, NULL, '<p>What do you want to do?</p>
<ul>
    <li>**Zoom in||Viewer/Basic viewer functionalities/Zoom in**</li>
    <li>**Zoom out||Viewer/Basic viewer functionalities/Zoom out**</li>
    <li>**Move the page||Viewer/Basic viewer functionalities/Move across page**</li>
    <li>**Rotate||Viewer/Basic viewer functionalities/Rotate**</li>
    <li>**Reset the view||Viewer/Basic viewer functionalities/Reset the view**</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (20, 14, NULL, '<p>
    When the page is first displayed in the viewer, it will be in a standard zoom: the whole page is visible on the screen. To get a better view of the page and details you are interested in, you can zoom in.
</p>
<p>
    There are several ways of zooming in:
</p>
<ul>
    <li><b>Zoom slider</b>
        <ul>
            <li>Grab the zoom slider and move it to the right.</li>
            <li>When the slider is all the way to the right, the page is at its maximum zoom.</li>
            <li>The center of the view will not change.</li>  
        </ul>
    </li>
    <li><b>Mouse scroll wheel</b>
        <ul>
            <li>Scroll forward with the mouse scroll wheel.</li>
            <li>The center of the view will be moved in the direction of the mouse.</li>
        </ul>
    </li>
    <li><b>Double clicking</b>
        <ul>
            <li>Double click in the page on the part you want to zoom in on.</li>
            <li>The place that was double clicked will become the new center of the view.</li>
        </ul>
    </li>
    <li><b>Numpad +</b>
        <ul>
            <li>Press the numpad + to zoom in.</li>
        </ul>
    </li>
</ul>
<p>
    The center of the view, is the part of the page that is in the middle of the viewer.
</p>
<p>
    <b>Tip:</b> You can also change the zoom by clicking on the bar of the zoom slider. The slider will be moved to that point and the zoom adjusted accordingly.</p>
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (21, 15, NULL, '<p>
    There are three ways of zooming out:
</p>
<ul>
    <li><b>Zoom slider</b>
        <ul>
            <li>Grab the zoom slider and move it to the left.</li>
            <li>When the slider is all the way to the left, the page is at its minimum zoom.</li>
            <li>The page will move to the centre of the view, as it is zoomed out to the point where the whole page is visible.</li>  
        </ul>
    </li>
    <li><b>Mouse scroll wheel</b>
        <ul>
            <li>Scroll backward with the mouse scroll wheel.</li>
        </ul>
    </li>
    <li><b>Numpad -</b>
        <ul>
            <li>Press the numpad - to zoom out.</li>
        </ul>
    </li>
</ul>
<p>
    The center of the view, is the part of the page that is in the middle of the viewer.
</p>
<p>
    <b>Tip:</b> You can also reset the zoom and rotation with the **reset the view** function.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (22, 16, NULL, '<p>
    There are two ways to move the view of a page:
</p>
<ul>
    <li><b>Drag with the mouse</b>
    <ol>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to move the page.</li>
    </ol>
    </li>
    <li><b>Move with the keyboard</b>
    <ul>
        <li><b>Numpad 8:</b> moves the view up.</li>
        <li><b>Numpad 2:</b> moves the view down.</li>
        <li><b>Numpad 4:</b> moves the view to the left.</li>
        <li><b>Numpad 6:</b> moves the view to the right.</li>
    </ul>
    </li>
</ul>
<p>
    <b>Tip:</b> The navigation box displays a red square on the page thumbnail of the current page, showing where you are.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (23, 17, NULL, '<p>
    There are two types of rotation. The crude rotation with buttons, from the buttons bar, and the more refined mouse rotation, which allows for very precise rotating.
</p>
<ul>
    <li><b>Buttons rotation</b>
    <ul>
        <li><b>Left rotate button:</b> rotates the page 45 degrees to the left.</li>
        <li><b>Right rotate button:</b> rotates the page 45 degrees to the right.</li>
    </ul>
    </li>
    <li><b>Mouse rotation</b>
    <ol>
        <li>Press and hold the ctrl key.</li>
        <li>Click and hold inside the viewer.</li>
        <li>Drag the mouse to a side to rotate.</li>
        <li>Release the mouse and ctrl key when you are done rotating.</li>
    </ol>
    </li>
</ul>
<p>
    When rotating, the center of the view is not changed.
</p>
<p>
    <b>Tip:</b> When you want to set the page straight again, you can use the **reset the view||Viewer/Reset the view** function to easely undo the rotation and zooming.</li>
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (13, 18, NULL, '<p>
    Reset the view is used to undo zooming and rotating. It restores the page to the view it was first presented in.
</p>
<p>
    There are two ways to activate this function:
</p>
<ul>
    <li>Click the reset view button on the buttons bar, to the right of the last page button.</li>
    <li>Press the home key on your keyboard.</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (12, 19, NULL, '<p>
    Where in the binding do you want to go?
</p>
<ul>
    <li>**Previous page||Viewer/Go to another page/Previous page**</li>
    <li>**Next page||Viewer/Go to another page/Next page**</li>
    <li>**First page||Viewer/Go to another page/First page**</li>
    <li>**Last page||Viewer/Go to another page/Last page**</li>
    <li>**Certain page number||Viewer/Go to another page/Certain page number**</li>
    <li>**Select a page||Viewer/Go to another page/Select a page**</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (25, 21, NULL, '<p>
    To go to the next page:
</p>
<ul>
    <li>Click the next page button in the buttons bar.</li>
</ul>
<p>
    The button is to the right of the textfield displaying the current page number. This function is only available if there is a next page.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (26, 22, NULL, '<p>
    With an easy press of a button, you can go straight to the first page in the binding.
</p>
<ul>
    <li>Click the first page button to go to the first page.</li>
</ul>
<p>
    The first page button is on the buttons bar, to the left of the next page button. This function is unavailable if the first page is already being displayed in the viewer.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (28, 24, NULL, '<p>
    You can skip straight to the end of the binding.
</p>
<ul>
    <li>Click the last page button to go to the last page.</li>
</ul>
<p>
    The last page button is on the buttons bar, to the right of the next page button. This function is unavaileble if the last page is already being displayed.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (29, 25, NULL, '<p>
    To directly go to a certain page:
</p>
<ol>
    <li>Enter the page number in the page number textfield.</li>
    <li>Press the enter key to load the requested page in the viewer.</li>
</ol>
<p>
    The page number textfield is found on the buttons bar in the viewer. It displays the page number of the currently being displayed page.
</p>
<p>    
    Do note that the page number used in the system may not be equivalent to the page number in the real book. The number represents the numeration of the scans. Extra scans, like the cover, or scans displaying two pages, effect the numbering.
</p>
<p>
    <b>Tip:</b>  You can also **select a page||Viewer/Select a page** in the book navigation box. 
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (30, 26, NULL, '<p>
    To quickly find an interesting looking page, you can use the navigation box in the information sidebar.
</p>
<ol>
    <li>Open the navigation box in the information sidebar to the right in the viewer.</li>
    <li>Find the page in the navigation box.</li>
    <li>Click the page and it is displayed in the viewer.</li>
</ol>
<p>
    <b>Tip:</b> Also note that the currently being viewed page has a red border marking the part of the page visible in the viewer.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (14, 27, NULL, '<p>
    For referring to a certain page, book or binding, there is the reference box in the information sidebar, which supplies links to each of these.
</p>

<ul>
    <li><b>Link to this binding:</b> supplies a link to the first page of the binding.</li>
    <li><b>Link to this book:</b> supplies a link to the first page of the book you are currently in.</li>
    <li><b>Link to this page:</b> supplies a link to the page currently being displayed in the viewer.</li>
</ul>

<p>
    To take the link out of the system, you need to copy and paste it:
</p>

<ol>
    <li>Open the reference box in the information sidebar.</li>
    <li>Click on the field of the link.</li>
    <li>Press ctrl + c to copy the link or rightclick on the field (with the link selected) and click on copy in the menu.</li>
    <li>You can now paste the link.</li>
</ol>

<p>
    <b>Tip:</b> The pages and transcriptions online can change over time. If you want a secure copy of the page and transcriptions, you should **export to pdf**.
</p>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (15, 28, NULL, '<ul>
    <li>All main functionality on this website is accessed through the buttons at the top of the page.</li>
    <li>The buttons will open new tabs, which will show up below the buttons. Click on them to open the page, or press the small ''x'' in the corner of a tab to close that tab.</li>
    <li>As a guest, you will see only a few buttons. Registered users will have more permissions, and once logged in will be able to see and click on more buttons to access additional functions. It is therefore recommended to start out by **registering||Register**, although registration is not needed for simply viewing the books.</li>
    <li>If you ever need help, simply press the ''Help'' button. It will open with information related to the page you were on while pressing the button.</li>
    <li>Many pages have sidebars: these contain extra functionalities and information concerning the current page. Pressing the arrow button at the top right of these sidebars will fold them away, or show them again. On some screens, you can change the width of the sidebars by left-clicking on the edge and dragging it left or right.</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (16, 29, NULL, '<p>
    The following is a short explanation of all the buttons. Some of these are only available and visible to logged in users. Click on the links for further details.
</p>

<ul>
    <li><b>**Search||Search**:</b> This is used to find and open books for reading.</li>
    <li><b>**Upload||Upload**:</b> Uploading new books can be done by pressing this button and following the instructions.</li>
    <li><b>Info:</b> For more information on what this website is about and its background, click here.</li>
    <li><b>Help:</b> Opens the help functionality. It will automatically open on the subject related to the type of page you are currently viewing.</li>
    <li><b>Users:</b> Shows the list of registered users.</li>
    <li><b>**Register||Register**:</b> Used for registering a new account.</li>
    <li><b>**Login / Logout||Welcome\Login / Logout**:</b> Used to enter your account and access all functionality.</li>
    <li><b>Forgot password?:</b> If you have forgotten your password, you can retrieve it here. </li>
    <li><b>**Edit profile||Edit profile**:</b> To change personal information or your password.</li>
</ul>', NULL, NULL, NULL, NULL);
INSERT INTO "HelpContents" ("helpContentId", "helpParagraphId", "settingValue", content, "createdOn", "createdBy", "changedOn", "changedBy") VALUES (11, 1, NULL, '<p>
    In case you ever want to change your password or the personal information you entered during **Register||registering**, simply press the ''Edit profile'' button while logged in. It will open a popup window in which you can edit your email address, first and last name, affiliation, occupation, website and password.
</p>

<p>
    In case you wish to change your password, make sure to fill in the ''Current password'' field as well as ''New password'' (and repeating the new password in the ''Repeat password'' field). This is an extra security check.
</p>', NULL, NULL, NULL, NULL);

INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (1, 'Albanian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (2, 'Arabic', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (3, 'Aramaic', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (4, 'Belarusian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (5, 'Bulgarian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (6, 'Celtic', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (7, 'Chinese', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (8, 'Croatian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (9, 'Czech', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (10, 'Danish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (11, 'Dutch', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (12, 'English', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (13, 'Estonian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (14, 'Finnish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (15, 'French', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (16, 'German', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (17, 'Greek', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (18, 'Hebrew', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (19, 'Hungarian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (20, 'Icelandic', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (21, 'Irish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (22, 'Italian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (23, 'Japanese', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (24, 'Latvian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (25, 'Lithuanian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (26, 'Macedonian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (27, 'Maltese', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (28, 'Norwegian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (29, 'Persian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (30, 'Polish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (31, 'Portuguese', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (32, 'Romanian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (33, 'Russian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (34, 'Sanskrit', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (35, 'Serbian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (36, 'Slovak', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (37, 'Slovenian', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (38, 'Spanish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (39, 'Syriac', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (40, 'Turkish', NULL, NULL, NULL, NULL);
INSERT INTO "Languages" ("languageId", "languageName", "createdOn", "createdBy", "changedOn", "changedBy") VALUES (41, 'Urkainian', NULL, NULL, NULL, NULL);

INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('activation-mail-subject', 'Activation of your account', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('user-declined-mail-subject', 'Account activation has been declined', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('deleted-user-id', '1', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('forgotpass-mail-subject', 'Restoration of your password', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('mail-from-address', 'no-reply@sp.urandom.nl', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('activation-mail-message', 'Dear Mr./Ms. [LASTNAME],

Your registration for [PROJECTNAME] has been accepted. Your username is [USERNAME].

Please click on the link below to activate your account:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The [PROJECTNAME] Team', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('forgotpass-mail-message', 'Dear Mr./Ms. [LASTNAME],

This e-mail has been send to you because you indicated you had forgotten your password for [PROJECTNAME]. If this is not the case, please ignore this message.


Your username is: [USERNAME]

Please click the following link (which will stop working after succesfully using it) to change your password:

[LINK]

If clicking this link does not work, try to copy and paste it into the address bar of your browser.


Regards,
The [PROJECTNAME] Team', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('user-declined-mail-message', 'Dear Mr./Ms. [LASTNAME],

Unfortunately your registration for [PROJECTNAME] has been declined. For more information, please contact the webmaster.

Regards,
The [PROJECTNAME] Team', NULL, NULL, NULL, NULL, FALSE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('auto-user-acceptance', '1', NULL, NULL, NULL, NULL, TRUE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('project-title', 'Annotated Books Online', NULL, NULL, NULL, NULL, TRUE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('welcome-page', '<h2>Welcome</h2>

<p>Historical readers left many traces in the books they owned. Names, notes, marks, and underlining provide unique evidence of how generations of readers used their books. Annotated Books Online gives full access to these unique copies. Focusing on the first three centuries of print, it enables scholars and students interested in the history of reading to collect, view and study reading practices. User tools include extensive search, viewing and annotating options.</p>

<a href="http://www.uu.nl/en" target="_blank" title="Go to the website of Utrecht University"><img src="frontend/resources/images/uu.png" style="height: 65px"/></a>
<a href="http://www.english.uva.nl/" target="_blank" title="Go to the website of University of Amsterdam"><img src="frontend/resources/images/uva.png" style="height: 60px"/></a>
<a href="http://www.princeton.edu/" target="_blank" title="Go to the website of Princeton University"><img src="frontend/resources/images/princeton.png" style="height: 65px"/></a>
<a href="http://www.ugent.be/en" target="_blank" title="Go to the website of Ghent University"><img src="frontend/resources/images/ugent.png" style="height: 100px"/></a>
<a href="http://www.livesandletters.ac.uk/" target="_blank" title="Go to the website of CELL"><img src="frontend/resources/images/cell.png" style="height: 100px"/></a>', NULL, NULL, NULL, NULL, TRUE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('terms-of-use', '<h2>Terms of Use</h2>

<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>

<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>', NULL, NULL, NULL, NULL, TRUE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('upload-instructions', '<h2>About this collaboratory</h2>

<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>

<p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>', NULL, NULL, NULL, NULL, TRUE);
INSERT INTO "Settings" ("settingName", "settingValue", "createdOn", "createdBy", "changedOn", "changedBy", visible) VALUES ('info-page', '<h2>About the project</h2>

<p>Annotated Books Online is a virtual research environment for scholars and students interested in historical reading practices. It is part of the research project "A Collaboratory for the Study of Reading and the Circulation of Ideas in Early Modern Europe" funded by the Dutch National Research Council (NWO). Generous additional funding was provided by Professor Anthony Grafton for the edition of Gabriel Harvey''s annotations to Livy (Mellon Foundation).</p>

<p>
<h3>Partners</h3> 
<ul>
<li>Paul Dijstelberge (University of Amsterdam)</li>
<li>Anthony Grafton (Princeton University)</li>
<li>Lisa Jardine (Centre for Editing Lives and Letters, Queen Mary, London)</li>
<li>Jürgen Pieters (Ghent University)</li>
<li>Els Stronks (Utrecht University)</li>
<li>Matthew Symonds (Centre for Editing Lives and Letters, Queen Mary, London)</li>
<li>Garrelt Verhoeven (University of Amsterdam)</li>
<li>Arnoud Visser (Utrecht University)</li>
</ul> 
</p>

<p>
<h3>Board of Advisors</h3> 
<ul>
<li>Professor Roger Chartier (Collège de France, Paris and Department of History & University of Pennsylvania)</li>
<li>Dr Cristina Dondi (Oxford & Consortium of European Research Libraries)</li>
<li>Professor Paul Hoftijzer (University of Leiden, Department of Book and Digital Media Studies)</li>
<li>Professor Howard Hotson (St Anne’s College, Oxford & Cultures of Knowledge Project)</li>
<li>Professor Lisa Kuitert (University of Amsterdam, Department of Book History)</li>
<li>Professor Jerome McGann (University of Virginia, Department of English)</li>
<li>Dr David Pearson (Director of Libraries, Archives and Guildhall Art Gallery London)</li>
<li>Professor Andrew Pettegree (University of St Andrews, Director Universal Short Title Catalogue)</li>
<li>Professor William Sherman (University of York, Department of English)</li>
<li>Professor Jacob Soll (Rutgers University, Department of History)</li>
<li>Professor Bob Owens (Open University, Director of Reading Experience Database)</li>
<li>Dr Henk Wals (The Hague, Huygens Institute for the History of the Netherlands, KNAW)</li>
</ul> 
</p>

<h3>Background</h3> 

<p>Proceeding from the idea that reading constitutes a crucial form of intellectual exchange, the collaborators will collect and enhance evidence of how readers used their books to build knowledge and assimilate ideas. This is especially pertinent since the early modern period, just like the twenty-first century, saw the revolutionary rise of a new medium of communication, which helped shape cultural formation and intellectual freedom.</p>

<p>Although widely recognized as a promising approach with important theoretical implications, currently the study of reading practices still largely depends on individual researchers, whose work is seriously hampered by the limited access to an inherently fragmented body of material. The proposed collaboratory will connect scholarly expertise and provide added value to digital sources through user-generated content (e.g. explanatory material or fuller scholarly syntheses) in an electronic environment specifically designed for research and teaching purposes. It will offer, in short, an academic Wikipedia for the history of reading and the circulation of ideas.</p>

<p>The project will create a transnational platform that enables scholars to (1) view, connect and study annotated books and readers'' notes, (2) offer training to students and young researchers in handling readers'' traces, and (3) make results freely accessible for teaching purposes, as well as for broader general interest by means of exhibitions, digital presentations and general publications. In order to expand this structural network, the principal partners in the collaboratory will prepare an application for a Marie Curie Initial Training Network.</p>

<p>For more information, contact Arnoud Visser, <a href="mailto:a.s.q.visser@uu.nl">a.s.q.visser@uu.nl</a> </p>', NULL, NULL, NULL, NULL, TRUE);

INSERT INTO "Users" ("userId", username, "passwordHash", email, "firstName", "lastName", affiliation, occupation, website, "homeAddress", banned, rank, "createdOn", "createdBy", "changedOn", "changedBy", "passwordRestoreToken", "activationStage", "registrationDate", "lastActive") VALUES (1, '<deleted user>', '', '', NULL, NULL, NULL, NULL, NULL, NULL, TRUE, 0, NULL, NULL, NULL, NULL, NULL, 3, '2012-02-07', '2012-02-07 21:57:19.525202');

CREATE TABLE "AnnotationsFT" (
    "annotationId" integer NOT NULL,
    "text" text NOT NULL,
    
    PRIMARY KEY ("annotationId"),
    FULLTEXT ("text")
) ENGINE=MyISAM;

CREATE TABLE "BooksFT" (
    "bookId" integer NOT NULL,
    "text" text NOT NULL,
    
    PRIMARY KEY ("bookId"),
    FULLTEXT ("text")
) ENGINE=MyISAM;

delimiter $$

CREATE FUNCTION authornames(bookid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Persons"."name" SEPARATOR ', ') INTO result FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Authors"."personId" FROM "Authors" WHERE "Authors"."bookId" = bookid
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION bindinglanguagenames(bindingid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Languages"."languageName" SEPARATOR ', ') INTO result FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BindingLanguages"."languageId" FROM "BindingLanguages" WHERE "BindingLanguages"."bindingId" = bindingid
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION booklanguagenames(bookid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Languages"."languageName" SEPARATOR ', ') INTO result FROM "Languages"
        WHERE "Languages"."languageId" IN
        (
            SELECT "BookLanguages"."languageId" FROM "BookLanguages" WHERE "BookLanguages"."bookId" = bookid
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION provenancenames(bindingid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT("Persons"."name" SEPARATOR ', ') INTO result FROM "Persons"
        WHERE "Persons"."personId" IN
        (
            SELECT "Provenances"."personId" FROM "Provenances" WHERE "Provenances"."bindingId" = bindingid
        );
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION annotationtext(annotationid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT("transcriptionEng", ' ', "transcriptionOrig") INTO result FROM "Annotations"
        WHERE "Annotations"."annotationId" = annotationid;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION booktext(bookid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT_WS(' ',
            "title",
            authorNames("bookId"),
            "publisher",
            "placePublished",
            bookLanguageNames("bookId"),
            provenanceNames("bindingId"),
            (SELECT "libraryName" FROM "Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId")),
            (SELECT "signature" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId"),
            bindingLanguageNames("bindingId"),
            bookAnnotationText("bookId")
        ) INTO result FROM "Books"
        WHERE "bookId" = bookid;
        RETURN COALESCE(result, '');
    END $$

CREATE FUNCTION bookannotationtext(bookid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT GROUP_CONCAT(annft.text SEPARATOR ' ') INTO result
        FROM "Books" JOIN (SELECT * FROM "Scans" ORDER BY page ASC) scans
            ON "Books"."bindingId" = scans."bindingId"
            AND "page" >= "firstPage"
            AND "page" <= "lastPage"
        LEFT JOIN "Annotations" annotations
            ON annotations."scanId" = scans."scanId"
        LEFT JOIN "AnnotationsFT" annft
            ON annft."annotationId" = annotations."annotationId"
        WHERE "bookId" = bookid;
        RETURN result;
    END $$

-- Annotations

CREATE TRIGGER "AnnotationsFulltextInsert" AFTER INSERT ON "Annotations"
  FOR EACH ROW BEGIN
    DECLARE pagenr integer;
    DECLARE binding integer;
    INSERT INTO "AnnotationsFT" SET "text" = annotationtext(NEW."annotationId"), "annotationId" = NEW."annotationId";
    SELECT page INTO pagenr FROM "Scans" WHERE "scanId" = NEW."scanId";
    SELECT "bindingId" INTO binding FROM "Scans" WHERE "scanId" = NEW."scanId";
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "Books"."bindingId" = binding
            AND pagenr >= "firstPage"
            AND pagenr <= "lastPage";
  END;
$$

CREATE TRIGGER "AnnotationsFulltextUpdate" AFTER UPDATE ON "Annotations"
  FOR EACH ROW BEGIN
    DECLARE pagenr integer;
    DECLARE binding integer;
    UPDATE "AnnotationsFT" SET "text" = annotationtext(NEW."annotationId") WHERE "annotationId" = NEW."annotationId";
    SELECT page INTO pagenr FROM "Scans" WHERE "scanId" = NEW."scanId";
    SELECT "bindingId" INTO binding FROM "Scans" WHERE "scanId" = NEW."scanId";
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "Books"."bindingId" = binding
            AND pagenr >= "firstPage"
            AND pagenr <= "lastPage";
  END;
$$

CREATE TRIGGER "AnnotationsFulltextDelete" AFTER DELETE ON "Annotations"
  FOR EACH ROW BEGIN
    DECLARE pagenr integer;
    DECLARE binding integer;
    DELETE FROM "AnnotationsFT" WHERE "annotationId" = OLD."annotationId";
    SELECT page INTO pagenr FROM "Scans" WHERE "scanId" = OLD."scanId";
    SELECT "bindingId" INTO binding FROM "Scans" WHERE "scanId" = OLD."scanId";
    UPDATE "Books"
        SET "bookId" = "bookId"
        WHERE "Books"."bindingId" = binding
            AND pagenr >= "firstPage"
            AND pagenr <= "lastPage";
  END;
$$


-- Books

CREATE TRIGGER "BooksFulltextInsert" AFTER INSERT ON "Books"
  FOR EACH ROW BEGIN
    INSERT INTO "BooksFT" SET "text" = booktext(NEW."bookId"), "bookId" = NEW."bookId";
  END;
$$

CREATE TRIGGER "BooksFulltextUpdate" AFTER UPDATE ON "Books"
  FOR EACH ROW BEGIN
    UPDATE "BooksFT" SET "text" = booktext(NEW."bookId") WHERE "bookId" = NEW."bookId";
  END;
$$

CREATE TRIGGER "BooksFulltextDelete" AFTER DELETE ON "Books"
  FOR EACH ROW BEGIN
    DELETE FROM "BooksFT" WHERE "bookId" = OLD."bookId";
  END;
$$

-- Bindings

CREATE TRIGGER "BindingsFulltextUpdate" AFTER UPDATE ON "Bindings"
  FOR EACH ROW BEGIN
    UPDATE "BooksFT" SET "text" = booktext("bookId") WHERE "bookId" IN (SELECT "bookId" FROM "Books" WHERE "bindingId" = NEW."bindingId");
  END;
$$

delimiter ;

DROP FUNCTION booktext;

DELIMITER $$

CREATE FUNCTION booktext(bookid integer) RETURNS text
    LANGUAGE SQL
    DETERMINISTIC
    READS SQL DATA
    SQL SECURITY INVOKER
    BEGIN
        DECLARE result text;
        SELECT CONCAT_WS(' ',
            "title",
            authorNames("bookId"),
            "publisher",
            "placePublished",
            bookLanguageNames("bookId"),
            provenanceNames("bindingId"),
            (SELECT "libraryName" FROM "Libraries" WHERE "libraryId" IN (SELECT "libraryId" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId" AND "Books"."bookId" = bookid)),
            (SELECT "signature" FROM "Bindings" WHERE "Books"."bindingId" = "Bindings"."bindingId" AND "Books"."bookId" = bookid),
            bindingLanguageNames("bindingId"),
            bookAnnotationText("bookId")
        ) INTO result FROM "Books"
        WHERE "Books"."bookId" = bookid;
        RETURN COALESCE(result, '');
    END $$

DELIMITER ;

delimiter $$

CREATE FUNCTION splitspaces(document text, pos integer)
    RETURNS text
    DETERMINISTIC
    BEGIN
        IF pos > LENGTH(document) - LENGTH(REPLACE(document, ' ', '')) + 1
            THEN RETURN NULL;
            ELSE RETURN REPLACE(SUBSTRING(SUBSTRING_INDEX(document, ' ', pos), LENGTH(SUBSTRING_INDEX(document, ' ', pos - 1)) + 1), ' ', '');
        END IF;
    END $$

CREATE FUNCTION headline(document text, query text, num integer)
    RETURNS text
    DETERMINISTIC
    BEGIN
        DECLARE x integer;
        DECLARE word text;
        DECLARE y integer;
        DECLARE simplequery text;
        DECLARE maxpos integer;
        DECLARE maxval float;
        DECLARE val float;
        DECLARE tmp float;
        DECLARE result text;
        
        SET simplequery = REPLACE(query, '+', '');
        CREATE TEMPORARY TABLE fts_tmp_table (
            pos integer,
            txt text,
            score float DEFAULT 0,
            PRIMARY KEY (pos)
        ) ENGINE=MyISAM;
        SET x = 0;
        REPEAT
            SET x = x + 1;
            SET word = splitspaces(document, x);
            IF word IS NOT NULL
                THEN INSERT INTO fts_tmp_table SET pos = x, txt = word;
            END IF;
        UNTIL word IS NULL
        END REPEAT;
        UPDATE fts_tmp_table SET score = MATCH(txt) AGAINST (simplequery IN BOOLEAN MODE);
        SET y = 1;
        SET val = 0;
        SET maxval = 0;
        SET maxpos = 0;
        REPEAT
            SELECT score FROM fts_tmp_table WHERE pos = y INTO tmp;
            SET val = val + tmp * num;
            IF val > maxval
                THEN SET maxval = val, maxpos = y;
            ELSEIF val >= 1
                THEN SET val = val - 1;
            END IF;
            SET y = y + 1;
        UNTIL y >= x
        END REPEAT;
        IF maxpos <= num
            THEN SET maxpos = 1;
            ELSE SET maxpos = maxpos - num + 1;
        END IF;
        UPDATE fts_tmp_table SET txt = CONCAT('<b>', txt, '</b>') WHERE score > 0;
        SELECT GROUP_CONCAT(txt SEPARATOR ' ') FROM fts_tmp_table WHERE pos >= maxpos AND pos < maxpos + num INTO result;
        DROP TEMPORARY TABLE fts_tmp_table;
        RETURN result;
    END $$

CREATE FUNCTION fulltextsearch(document text, query text)
    RETURNS float
    DETERMINISTIC
    BEGIN
        DECLARE result float;
        CREATE TEMPORARY TABLE fulltext_tmp_table ENGINE=MyISAM AS (SELECT document AS doc);
        SELECT MATCH (doc) AGAINST (query IN BOOLEAN MODE) FROM fulltext_tmp_table INTO result;
        DROP TEMPORARY TABLE fulltext_tmp_table;
        RETURN result;
    END $$

delimiter ;

