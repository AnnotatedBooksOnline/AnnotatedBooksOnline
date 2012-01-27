BEGIN TRANSACTION;

UPDATE "Annotations" SET "timeChanged" = "timeCreated" WHERE "timeChanged" IS NULL;

COMMIT;