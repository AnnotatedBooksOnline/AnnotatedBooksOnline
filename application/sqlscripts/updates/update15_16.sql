BEGIN TRANSACTION;

-- Drop NOT NULL-constraint of binding titles.
UPDATE "Bindings" ALTER COLUMN "title" DROP NOT NULL;

COMMIT;
