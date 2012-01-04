BEGIN TRANSACTION;

-- Give Annotations a scanId instead of page/bookId
ALTER TABLE "Annotations" ADD COLUMN "scanId" integer;
ALTER TABLE "Annotations" ADD FOREIGN KEY ("scanId") REFERENCES "Scans" ("scanId") ON UPDATE NO ACTION ON DELETE NO ACTION;
UPDATE "Annotations" SET "scanId" = (SELECT "scanId" FROM "Scans" WHERE "Scans"."bookId" = "Annotations"."bookId" AND "Scans"."page" = "Annotations"."page");
ALTER TABLE "Annotations" ALTER COLUMN "scanId" SET NOT NULL;

-- Enforce strictness of the bindingId in scans, drop bookId.
ALTER TABLE "Scans" DROP CONSTRAINT "Scans_check";
-- ALTER TABLE "Scans" DROP CONSTRAINT "Scans_check1";
ALTER TABLE "Scans" ADD FOREIGN KEY ("bindingId") REFERENCES "Bindings" ("bindingId") ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "Scans" ADD CONSTRAINT "Scans_check" CHECK (status <> 0 OR "bindingId" IS NOT NULL AND page IS NOT NULL AND width IS NOT NULL AND height IS NOT NULL AND "zoomLevel" IS NOT NULL);

-- Drop no longer needed columns
ALTER TABLE "Bindings" DROP COLUMN "pagesToFirst";
ALTER TABLE "Bindings" DROP COLUMN "pagesFromLast";
ALTER TABLE "Annotations" DROP COLUMN "bookId";
ALTER TABLE "Annotations" DROP COLUMN "page";
ALTER TABLE "Scans" DROP COLUMN "bookId";

COMMIT;

