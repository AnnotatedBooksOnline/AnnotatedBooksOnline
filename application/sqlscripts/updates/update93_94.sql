SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue", "visible") VALUES ('greeter-file', 'welcome.html', 1);
INSERT INTO "##PREFIX##Settings" ("settingName", "settingValue", "visible") VALUES ('greeter-title', 'Welcome', 1);

COMMIT;

