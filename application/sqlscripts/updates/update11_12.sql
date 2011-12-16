-- Column in Authors-table renamed for consistancy.

BEGIN TRANSACTION;

ALTER TABLE "Authors" RENAME "authorId"  TO "personId";

COMMIT;
