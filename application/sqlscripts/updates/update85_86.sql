SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- The setting 'annotationInfoCategories' should be visible.
UPDATE "Settings" SET "visible" = 1 WHERE "settingName" = 'annotationInfoCategories';

COMMIT;
