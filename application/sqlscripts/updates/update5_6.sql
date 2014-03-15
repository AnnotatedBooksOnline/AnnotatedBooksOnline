BEGIN TRANSACTION;

-- Add additional information to Scans table.

ALTER TABLE "##PREFIX##Scans" ADD COLUMN width integer;
ALTER TABLE "##PREFIX##Scans" ADD COLUMN height integer;
ALTER TABLE "##PREFIX##Scans" ADD COLUMN "zoomLevel" integer;

UPDATE "##PREFIX##Scans" SET width = 0 WHERE width IS NULL;
UPDATE "##PREFIX##Scans" SET height = 0 WHERE height IS NULL;
UPDATE "##PREFIX##Scans" SET "zoomLevel" = 0 WHERE "zoomLevel" IS NULL;

ALTER TABLE "##PREFIX##Scans" ALTER COLUMN width SET NOT NULL;
ALTER TABLE "##PREFIX##Scans" ALTER COLUMN height SET NOT NULL;
ALTER TABLE "##PREFIX##Scans" ALTER COLUMN "zoomLevel" SET NOT NULL;

COMMIT;

