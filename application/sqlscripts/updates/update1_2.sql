-- Bindings should also have titles.
ALTER TABLE "Bindings" ADD COLUMN title varchar(100) NOT NULL;
ALTER TABLE "Bindings"
    ALTER COLUMN "signature" TYPE varchar(255);

-- Add some defaults to user for convenience.
ALTER TABLE "Users"
   ALTER COLUMN "active" SET DEFAULT '0';
ALTER TABLE "Users"
   ALTER COLUMN "banned" SET DEFAULT '0';
ALTER TABLE "Users"
   ALTER COLUMN "rank" SET DEFAULT 50;
   

-- TEIFiles should belong to either a book or binding. Not necessarily both.
ALTER TABLE "TEIFiles"
   ALTER COLUMN "bookId" DROP NOT NULL;
ALTER TABLE "TEIFiles"
   ALTER COLUMN "bindingId" DROP NOT NULL;
ALTER TABLE "TEIFiles" ADD UNIQUE ("bookId", "bindingId");

   
-- Many foreign keys automatically got a default that generates a new ID (because they were given the serial type instead of integer).
-- This is incorrect and error prone, therefore those should be removed.
ALTER TABLE "BannedUsers"
   ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Bindings"
   ALTER COLUMN "libraryId" DROP DEFAULT;
ALTER TABLE "BookLanguages"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "BookLanguages"
   ALTER COLUMN "bookID" DROP DEFAULT;
ALTER TABLE "Books"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "PendingUsers"
   ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "Provenances"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "Provenances"
   ALTER COLUMN "personId" DROP DEFAULT;
ALTER TABLE "Scans"
   ALTER COLUMN "bookId" DROP DEFAULT;
ALTER TABLE "TEIFiles"
   ALTER COLUMN "bookId" DROP DEFAULT;
ALTER TABLE "TEIFiles"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "TEIFiles"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "Authors"
   ALTER COLUMN "authorId" DROP DEFAULT;
ALTER TABLE "Authors"
   ALTER COLUMN "bookId" DROP DEFAULT;
