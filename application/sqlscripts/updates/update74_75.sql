SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

-- Drop the UNIQUE constraint on signature and libraryId.
DROP INDEX "signature" ON "##PREFIX##Bindings";

COMMIT;
