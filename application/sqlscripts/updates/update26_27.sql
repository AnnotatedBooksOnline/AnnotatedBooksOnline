BEGIN TRANSACTION;

-- Add an accepted column to PendingUsers.
ALTER TABLE "PendingUsers" ADD COLUMN "accepted" bit DEFAULT '1';

COMMIT;
