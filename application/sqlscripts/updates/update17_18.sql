ALTER TABLE "Scans" DROP COLUMN "fileName";

UPDATE "Scans" SET "width" = 0 WHERE "width" IS NULL;
ALTER TABLE "Scans" ALTER COLUMN "width" SET NOT NULL;
UPDATE "Scans" SET "height" = 0 WHERE "height" IS NULL;
ALTER TABLE "Scans" ALTER COLUMN "height" SET NOT NULL;
UPDATE "Scans" SET "zoomLevel" = 0 WHERE "zoomLevel" IS NULL;
ALTER TABLE "Scans" ALTER COLUMN "zoomLevel" SET NOT NULL;

ALTER TABLE "Scans" ADD COLUMN "uploadId" int;
ALTER TABLE "Scans" ADD FOREIGN KEY ("uploadId") REFERENCES "Uploads";