SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

UPDATE "##PREFIX##Settings" SET "settingValue" = 'Description,Interpretation,References,_Color,Comparison,Transcription,Translation,Observations,Editor\'s note' WHERE "settingName" = 'annotationInfoCategories';
UPDATE "##PREFIX##Settings" SET "settingValue" = '0,3,4,7,6,1,2,5,8' WHERE "settingName" = 'annotationInfoOrder';

COMMIT;

