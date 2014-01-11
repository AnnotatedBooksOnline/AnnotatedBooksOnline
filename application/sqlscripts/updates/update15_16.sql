BEGIN TRANSACTION;

-- Drop NOT NULL-constraint of binding titles.
ALTER TABLE "##PREFIX##Bindings" ALTER COLUMN "title" DROP NOT NULL;

-- Add uploadId to Scans table.
ALTER TABLE "##PREFIX##Scans" ADD COLUMN "uploadId" integer;
ALTER TABLE "##PREFIX##Scans" ADD FOREIGN KEY ("uploadId") REFERENCES "##PREFIX##Uploads" ("uploadId") ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;
