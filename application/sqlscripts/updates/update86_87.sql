SET NAMES 'utf8' COLLATE 'utf8_unicode_ci';
SET storage_engine = INNODB;
SET sql_mode = 'ANSI_QUOTES';

USE abo;

START TRANSACTION;

ALTER TABLE "Users" ADD COLUMN "currentBindingId" int;
ALTER TABLE "Users" ADD CONSTRAINT "Users_currentBindingId_fkey" FOREIGN KEY ("currentBindingId") 
    REFERENCES "Bindings" ("bindingId") 
    ON DELETE SET NULL;

COMMIT;
