SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Whenever an Annotation is changed, its properties should be stored in this table before being
-- overwritten. Note that the most recent annotation is stored in the Annotations table but not
-- here.
--
-- The column annotationId refers to the Annotation of which this is a previous version.
-- Revised annotations can be chronologically ordened by the column revisionNumber.
CREATE TABLE "RevisedAnnotations"
(
    "changedOn" timestamp ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changedBy" character varying(30),
    "createdOn" timestamp NOT NULL,
    "createdBy" character varying(30),
    
    "revisedAnnotationId" integer NOT NULL AUTO_INCREMENT,
    "annotationId"        integer,             -- Null if the annotation has been deleted.
    "transcriptionEng"    text NOT NULL,
    "transcriptionOrig"   text NOT NULL,
    "polygon"             text NOT NULL,
    "changedUserId"       integer NOT NULL,
    "revisionCreateTime"  timestamp NOT NULL,
    "revisionNumber"      integer NOT NULL,
    
    PRIMARY KEY ("revisedAnnotationId"),
    FOREIGN KEY ("changedUserId") 
        REFERENCES "Users" ("userId"),
    FOREIGN KEY ("annotationId")
        REFERENCES "Annotations" ("annotationId")
        ON DELETE SET NULL
);


COMMIT;
