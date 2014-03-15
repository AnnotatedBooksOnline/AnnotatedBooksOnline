BEGIN TRANSACTION;

-- Allow nested shelves.
ALTER TABLE "##PREFIX##Shelves" ADD COLUMN "parentShelfId" integer;
ALTER TABLE "##PREFIX##Shelves" ADD FOREIGN KEY ("parentShelfId") 
    REFERENCES "##PREFIX##Shelves";

-- TODO: When deleting a shelf, also delete children or manually do this first?

COMMIT;
