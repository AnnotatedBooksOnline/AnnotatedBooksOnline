SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Add (default empty) alternate homepage url.
INSERT INTO "Settings" ("settingName", "settingValue", "visible") VALUES ('homepage-url', '', 1);

COMMIT;
