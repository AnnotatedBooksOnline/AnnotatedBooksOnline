SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

UPDATE "Permissions" SET "minRank" = 40 WHERE "actionName" = 'view-users-part';
UPDATE "Permissions" SET "minRank" = 40 WHERE "actionName" = 'view-users-complete';
UPDATE "Permissions" SET "minRank" = 40 WHERE "actionName" = 'accept-registrations';

COMMIT;

