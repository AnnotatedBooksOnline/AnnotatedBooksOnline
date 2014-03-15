START TRANSACTION;

-- Let scans keep track of a bindingId rather than a bookId.

ALTER TABLE "##PREFIX##Scans" ADD COLUMN "bindingId" integer;

UPDATE "##PREFIX##Scans" SET "bindingId" = (
    SELECT "bindingId" FROM "##PREFIX##Books" WHERE "##PREFIX##Scans"."bookId" IS NOT NULL 
                                      AND "##PREFIX##Books"."bookId" = "##PREFIX##Scans"."bookId"
);

-- ALTER TABLE "##PREFIX##Scans" DROP COLUMN "bookId";


COMMIT;
