BEGIN TRANSACTION;

-- Adds a status column to Bindings.
ALTER TABLE "Bindings" ADD COLUMN "status" smallint NOT NULL DEFAULT 0;

COMMIT;
