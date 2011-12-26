BEGIN TRANSACTION;

-- Makes some columns of Scans nullable.

ALTER TABLE "Scans"
   ALTER COLUMN "bookId" DROP NOT NULL;
ALTER TABLE "Scans"
   ALTER COLUMN page DROP NOT NULL;
ALTER TABLE "Scans"
   ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE "Scans" ADD CONSTRAINT "Scans_check" CHECK ("status" <> 0 OR ("bookId" IS NOT NULL AND "page" IS NOT NULL AND "width" IS NOT NULL AND "height" IS NOT NULL AND "zoomLevel" IS NOT NULL));

COMMIT;

