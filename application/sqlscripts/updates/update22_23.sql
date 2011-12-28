BEGIN TRANSACTION;

-- Allow nested shelves.
ALTER TABLE "Shelves" ADD COLUMN "parentShelfId" integer;
ALTER TABLE "Shelves" ADD FOREIGN KEY ("parentShelfId") 
    REFERENCES "Shelves";

-- TODO: When deleting a shelf, also delete children or manually do this first?

COMMIT;
