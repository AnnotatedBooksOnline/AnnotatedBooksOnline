BEGIN TRANSACTION;

-- Add activation column to Users.
ALTER TABLE "Users" ADD COLUMN "activationStage" smallint NOT NULL DEFAULT 0;

-- Set stage of activated users.
UPDATE "Users" SET "activationStage" = 3 WHERE "active" = '1';

-- Set stage of accepted yet unactivated Users.
UPDATE "Users" SET "activationStage" = 1 WHERE "active" = '0' 
    AND "userId" IN (SELECT "userId" FROM "PendingUsers" WHERE "accepted" = '1');

-- Set stage of declined users.
UPDATE "Users" SET "activationStage" = 2 WHERE "active" = '0' 
    AND "userId" IN (SELECT "userId" FROM "PendingUsers" WHERE "accepted" = '0');

-- DROP Users.active and PendingUsers.accepted columns.
ALTER TABLE "Users" DROP COLUMN "active";
ALTER TABLE "PendingUsers" DROP COLUMN "accepted";

ALTER TABLE "Users" ALTER COLUMN "activationStage" DROP DEFAULT;

COMMIT;
