BEGIN TRANSACTION;

UPDATE "##PREFIX##Annotations" SET "timeCreated" = NOW() WHERE "timeCreated" IS NULL;
UPDATE "##PREFIX##Annotations" SET "timeChanged" = "timeCreated" WHERE "timeChanged" IS NULL;

ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "timeChanged" SET NOT NULL;
ALTER TABLE "##PREFIX##Annotations" ALTER COLUMN "timeCreated" SET NOT NULL;

COMMIT;