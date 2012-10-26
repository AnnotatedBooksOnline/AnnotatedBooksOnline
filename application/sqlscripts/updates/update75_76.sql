SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Add Latin to Languages table.
INSERT INTO "Languages" ("languageName") VALUES ('Latin');

COMMIT;
