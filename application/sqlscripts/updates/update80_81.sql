SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Add a column containing simple comments corresponding to a single scan that can be edited by
-- all registered users.
ALTER TABLE "Scans" ADD COLUMN "comments" varchar(5000) NOT NULL DEFAULT '';

-- Also insert scan commenting in the permissions table.
INSERT INTO "Permissions" ("actionName", "minRank") VALUES ('edit-scan-comments', 10);

COMMIT;
