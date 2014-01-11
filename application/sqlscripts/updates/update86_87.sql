SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Add a column for annotation info: user-supplied information relevant to the annotation such as
-- transcriptions, descriptions, translations and comments. The contents of this column are 
-- seperated by comma's (,); any ',' in the texts are escaped as as '\,' and '\' is escaped as '\\'. 
-- The position annotation info has in this list indicates its category; see below for the 
-- available categories.
-- In ABO, this will replace the transcriptionEng and transcriptionOrig columns.
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "annotationInfo" text;

-- Also add annotationInfo to RevisedAnnotations.
ALTER TABLE "##PREFIX##RevisedAnnotations" ADD COLUMN "annotationInfo" text;

-- Add a setting containing the displayed names of categories of annotation info. This is formatted 
-- as a comma-seperated lists. The length of this list denotes the number of categories.
-- In ABO, the available catagories will contain transcriptions, translations and comments. The 
-- latter is a new feature.
-- The first category in this list is the one displayed at first.
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue", "visible") 
    VALUES ('annotationInfoCategories', 'Original Language,English,Comments', 1);
    

-- Copy the contents of the transcriptionEng and transcriptionOrig columns into annotationInfo. 
-- Retain the old columns for now.
UPDATE "##PREFIX##Annotations" SET "annotationInfo" = CONCAT(REPLACE(REPLACE(transcriptionEng, '\\', '\\\\'), ',', '\\,'), ',', REPLACE(REPLACE(transcriptionOrig, '\\', '\\\\'), ',', '\\,'));
    
-- Do the same for RevisedAnnotations.
UPDATE "##PREFIX##RevisedAnnotations" SET "annotationInfo" = CONCAT(REPLACE(REPLACE(transcriptionEng, '\\', '\\\\'), ',', '\\,'), ',', REPLACE(REPLACE(transcriptionOrig, '\\', '\\\\'), ',', '\\,'));


-- Now we can add NOT NULL contraints to the info columns.
ALTER TABLE "##PREFIX##Annotations" MODIFY "annotationInfo" text NOT NULL;
ALTER TABLE "##PREFIX##RevisedAnnotations" MODIFY "annotationInfo" text NOT NULL;

COMMIT;
