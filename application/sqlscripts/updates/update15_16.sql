BEGIN TRANSACTION;

-- Drop NOT NULL-constraint of binding titles.
ALTER TABLE "Bindings" ALTER COLUMN "title" DROP NOT NULL;

-- Add uploadId to Scans table.
ALTER TABLE "Scans" ADD COLUMN "uploadId" integer;
ALTER TABLE "Scans" ADD FOREIGN KEY ("uploadId") REFERENCES "Uploads" ("uploadId") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Include in check that uploadId should've been set back to NULL when the status is 0.
ALTER TABLE "Scans" DROP CONSTRAINT "Scans_check";
ALTER TABLE "Scans" ADD CHECK (("status" <> 0 OR ("bookId" IS NOT NULL AND "page" IS NOT NULL AND "width" IS NOT NULL AND "height" IS NOT NULL AND "zoomLevel" IS NOT NULL AND "uploadId" IS NULL)));

COMMIT;
