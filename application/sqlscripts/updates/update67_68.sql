START TRANSACTION;

ALTER TABLE "Books" ALTER COLUMN "printVersion" TYPE varchar(30);
UPDATE "Books" SET "printVersion"='' WHERE "printVersion"='0';

COMMIT;