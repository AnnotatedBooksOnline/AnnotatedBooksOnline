START TRANSACTION;

ALTER TABLE "##PREFIX##Books" ALTER COLUMN "printVersion" TYPE varchar(30);
UPDATE "##PREFIX##Books" SET "printVersion"='' WHERE "printVersion"='0';

COMMIT;