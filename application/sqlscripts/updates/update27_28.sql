BEGIN TRANSACTION;

-- Adds a status column to Bindings.
ALTER TABLE "##PREFIX##Bindings" ADD COLUMN "status" smallint NOT NULL DEFAULT 0;

COMMIT;
