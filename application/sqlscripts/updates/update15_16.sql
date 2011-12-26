BEGIN TRANSACTION;

-- Drop NOT NULL-constraint of binding titles.
ALTER TABLE "Bindings" ALTER COLUMN "title" DROP NOT NULL;

-- Add uploadId to Scans table.
ALTER TABLE "Scans" ADD COLUMN "uploadId" integer;
ALTER TABLE "Scans" ADD FOREIGN KEY ("uploadId") REFERENCES "Uploads" ("uploadId") ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
