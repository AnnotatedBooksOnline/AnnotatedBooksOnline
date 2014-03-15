START TRANSACTION;

ALTER TABLE "##PREFIX##Users" ADD COLUMN "registrationDate" DATE;
ALTER TABLE "##PREFIX##Users" ADD COLUMN "lastActive" TIMESTAMP;

UPDATE "##PREFIX##Users" SET "registrationDate" = current_date, "lastActive" = current_timestamp;

ALTER TABLE "##PREFIX##Users" ALTER COLUMN "registrationDate" SET NOT NULL;

COMMIT;