BEGIN TRANSACTION;

-- Drop NOT NULL-constraint of binding titles.
ALTER TABLE "Bindings" ALTER COLUMN "title" DROP NOT NULL;

COMMIT;
