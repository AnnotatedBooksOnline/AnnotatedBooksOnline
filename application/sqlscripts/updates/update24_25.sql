START TRANSACTION;

-- Adds a position column to the shelfs table.
ALTER TABLE "##PREFIX##Shelves" ADD COLUMN "position" integer DEFAULT 0;

COMMIT;
