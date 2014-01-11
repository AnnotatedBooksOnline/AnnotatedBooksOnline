BEGIN TRANSACTION;

-- Adds a scanType column to Scans.

ALTER TABLE "##PREFIX##Scans" ADD COLUMN "scanType" character(4);
UPDATE "##PREFIX##Scans" SET "scanType" = '' WHERE "scanType" IS NULL;
ALTER TABLE "##PREFIX##Scans" ALTER COLUMN "scanType" SET NOT NULL;
ALTER TABLE "##PREFIX##Scans" ADD CONSTRAINT "##PREFIX##Scans_check1" CHECK ("scanType" = 'jpeg' OR "scanType" = 'tiff' OR "scanType" = '');

COMMIT;
