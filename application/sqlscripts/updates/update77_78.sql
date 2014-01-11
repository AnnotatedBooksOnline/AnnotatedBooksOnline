SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- New settings from previous transaction should have been visible.
UPDATE "##PREFIX##Settings" SET "visible" = 1 WHERE "settingName" = 'show-welcome-page'
                                       OR "settingName" = 'info-button';

COMMIT;
