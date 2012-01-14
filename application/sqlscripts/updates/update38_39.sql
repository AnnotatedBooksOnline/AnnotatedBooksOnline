BEGIN TRANSACTION;

-- Make sure there are no more scans with status 0.
UPDATE "Scans" SET "status" = 5 WHERE "status" = 0;

-- Check is no longer correct, could just as well be removed.
ALTER TABLE "Scans" DROP CONSTRAINT "Scans_check";

COMMIT;
