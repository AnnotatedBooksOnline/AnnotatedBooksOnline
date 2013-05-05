SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

UPDATE "Settings" SET "settingValue" = 'Description,Interpretation,References,_Color,Comparison' WHERE "settingName" = 'annotationInfoCategories';
INSERT INTO "Settings" ("settingName", "settingValue", "visible") VALUES ('annotationInfoOrder', '0,1,3,4,2', 1);

COMMIT;

