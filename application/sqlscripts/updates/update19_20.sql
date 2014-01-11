BEGIN TRANSACTION;

-- Give Annotations a scanId instead of page/bookId
ALTER TABLE "##PREFIX##Annotations" ADD COLUMN "scanId" integer;
ALTER TABLE "##PREFIX##Annotations" ADD FOREIGN KEY ("scanId") REFERENCES "##PREFIX##Scans" ("scanId") ON UPDATE NO ACTION ON DELETE NO ACTION;
UPDATE "##PREFIX##Annotations" SET "scanId" = (SELECT "scanId" FROM "##PREFIX##Scans" WHERE "##PREFIX##Scans"."bookId" = "##PREFIX##Annotations"."bookId" AND "##PREFIX##Scans"."page" = "##PREFIX##Annotations"."page");
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "scanId" SET NOT NULL;

-- Enforce strictness of the bindingId in scans, drop bookId.
ALTER TABLE "##PREFIX##Scans" DROP CONSTRAINT "##PREFIX##Scans_check";
-- ALTER TABLE "##PREFIX##Scans" DROP CONSTRAINT "##PREFIX##Scans_check1";
ALTER TABLE "##PREFIX##Scans" ADD FOREIGN KEY ("bindingId") REFERENCES "##PREFIX##Bindings" ("bindingId") ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE "##PREFIX##Scans" ADD CONSTRAINT "##PREFIX##Scans_check" CHECK (status <> 0 OR "bindingId" IS NOT NULL AND page IS NOT NULL AND width IS NOT NULL AND height IS NOT NULL AND "zoomLevel" IS NOT NULL);

-- Drop no longer needed columns
ALTER TABLE "##PREFIX##Bindings" DROP COLUMN "pagesToFirst";
ALTER TABLE "##PREFIX##Bindings" DROP COLUMN "pagesFromLast";
ALTER TABLE "##PREFIX##Annotations" DROP COLUMN "bookId";
ALTER TABLE "##PREFIX##Annotations" DROP COLUMN "page";
ALTER TABLE "##PREFIX##Scans" DROP COLUMN "bookId";

COMMIT;

