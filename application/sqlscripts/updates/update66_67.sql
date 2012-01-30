START TRANSACTION;

ALTER TABLE "Users" ADD COLUMN "registrationDate" DATE;
ALTER TABLE "Users" ADD COLUMN "lastActive" TIMESTAMP;

UPDATE "Users" SET "registrationDate" = current_date, "lastActive" = current_timestamp;

ALTER TABLE "Users" ALTER COLUMN "registrationDate" SET NOT NULL;

COMMIT;