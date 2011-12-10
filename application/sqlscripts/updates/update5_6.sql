BEGIN TRANSACTION;

-- Add additional information to Scans table.

ALTER TABLE "Scans" ADD COLUMN width integer;
ALTER TABLE "Scans" ADD COLUMN height integer;
ALTER TABLE "Scans" ADD COLUMN "zoomLevel" integer;

UPDATE "Scans" SET width = 0 WHERE width IS NULL;
UPDATE "Scans" SET height = 0 WHERE height IS NULL;
UPDATE "Scans" SET "zoomLevel" = 0 WHERE "zoomLevel" IS NULL;

ALTER TABLE "Scans" ALTER COLUMN width SET NOT NULL;
ALTER TABLE "Scans" ALTER COLUMN height SET NOT NULL;
ALTER TABLE "Scans" ALTER COLUMN "zoomLevel" SET NOT NULL;

COMMIT;

