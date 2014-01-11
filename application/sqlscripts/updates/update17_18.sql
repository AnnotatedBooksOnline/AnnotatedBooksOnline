BEGIN TRANSACTION;

-- Fixed a bug that could result in strange behavior when making a mistake while inserting into the uploads table.
ALTER TABLE "##PREFIX##Uploads" ALTER COLUMN "userId" DROP DEFAULT;

COMMIT;
