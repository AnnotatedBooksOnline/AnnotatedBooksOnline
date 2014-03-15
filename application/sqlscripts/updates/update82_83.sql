SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Create a table for scan comments. A history of previous versions is maintained, as well as the 
-- last editors of each version.
CREATE TABLE "##PREFIX##ScanComments"
(
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),
    
    "scanCommentId" integer NOT NULL AUTO_INCREMENT,
    "userId" integer,
    "scanId" integer NOT NULL,
    "comments" varchar(5000) NOT NULL,
    "versionNumber" integer NOT NULL,
    
    PRIMARY KEY ("scanCommentId"),
    FOREIGN KEY ("userId") 
        REFERENCES "##PREFIX##Users" ("userId")
        ON DELETE SET NULL,
    FOREIGN KEY ("scanId")
        REFERENCES "##PREFIX##Scans" ("scanId")
        ON DELETE CASCADE,
        
    UNIQUE ("scanId", "versionNumber")
);

-- The comments column from Scans can be removed.
ALTER TABLE "##PREFIX##Scans" DROP COLUMN "comments";

COMMIT;
