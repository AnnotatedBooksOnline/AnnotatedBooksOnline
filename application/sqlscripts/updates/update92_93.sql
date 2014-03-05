SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('edit-meta', 10);
ALTER TABLE "Books" ADD COLUMN "meta" text;

COMMIT;

