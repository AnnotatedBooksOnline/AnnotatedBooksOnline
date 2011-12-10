BEGIN TRANSACTION;

-- Adds a scanType column to Scans.

ALTER TABLE "Scans" ADD COLUMN "scanType" character(4);
UPDATE "Scans" SET "scanType" = '' WHERE "scanType" IS NULL;
ALTER TABLE "Scans" ALTER COLUMN "scanType" SET NOT NULL;
ALTER TABLE "Scans" ADD CHECK ("scanType" = 'jpeg' OR "scanType" = 'tiff' OR "scanType" = '');

COMMIT;
