START TRANSACTION;

-- Let scans keep track of a bindingId rather than a bookId.

ALTER TABLE "Scans" ADD COLUMN "bindingId" integer;

UPDATE "Scans" SET "bindingId" = (
    SELECT "bindingId" FROM "Books" WHERE "Scans"."bookId" IS NOT NULL 
                                      AND "Books"."bookId" = "Scans"."bookId"
);

-- ALTER TABLE "Scans" DROP COLUMN "bookId";


COMMIT;
