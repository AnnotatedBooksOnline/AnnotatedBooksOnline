-- Column in Authors-table renamed for consistancy.

BEGIN TRANSACTION;

ALTER TABLE "##PREFIX##Authors" RENAME "authorId"  TO "personId";

COMMIT;
