-- Adds a column to Users used for restoring forgotten passwords. This is usually NULL.

BEGIN TRANSACTION;

ALTER TABLE "Users" ADD COLUMN "passwordRestoreToken" character(32);

COMMIT;
