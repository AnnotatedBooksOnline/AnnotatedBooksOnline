BEGIN TRANSACTION;

UPDATE "Annotations" SET "timeCreated" = NOW() WHERE "timeCreated" IS NULL;
UPDATE "Annotations" SET "timeChanged" = "timeCreated" WHERE "timeChanged" IS NULL;

ALTER TABLE "Annotations" ALTER COLUMN "timeChanged" SET NOT NULL;
ALTER TABLE "Annotations" ALTER COLUMN "timeCreated" SET NOT NULL;

COMMIT;