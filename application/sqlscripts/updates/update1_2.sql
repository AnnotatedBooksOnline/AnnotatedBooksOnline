BEGIN TRANSACTION;

-- Bindings should also have titles.
ALTER TABLE "##PREFIX##Bindings" ADD COLUMN title varchar(100) NOT NULL;
ALTER TABLE "##PREFIX##Bindings"
    ALTER COLUMN "signature" TYPE varchar(255);

-- Add some defaults to user for convenience.
ALTER TABLE "##PREFIX##Users"
   ALTER COLUMN "active" SET DEFAULT '0';
ALTER TABLE "##PREFIX##Users"
   ALTER COLUMN "banned" SET DEFAULT '0';
ALTER TABLE "##PREFIX##Users"
   ALTER COLUMN "rank" SET DEFAULT 50;
   

-- TEIFiles should belong to either a book or binding. Not necessarily both.
ALTER TABLE "##PREFIX##TEIFiles"
   ALTER COLUMN "bookId" DROP NOT NULL;
ALTER TABLE "##PREFIX##TEIFiles"
   ALTER COLUMN "bindingId" DROP NOT NULL;
ALTER TABLE "##PREFIX##TEIFiles" ADD UNIQUE ("bookId", "bindingId");

   
-- Many foreign keys automatically got a default that generates a new ID (because they were given the serial type instead of integer).
-- This is incorrect and error prone, therefore those should be removed.
ALTER TABLE "##PREFIX##BannedUsers"
   ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Bindings"
   ALTER COLUMN "libraryId" DROP DEFAULT;
ALTER TABLE "##PREFIX##BookLanguages"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "##PREFIX##BookLanguages"
   ALTER COLUMN "bookID" DROP DEFAULT;
ALTER TABLE "##PREFIX##Books"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "##PREFIX##PendingUsers"
   ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Provenances"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Provenances"
   ALTER COLUMN "personId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Scans"
   ALTER COLUMN "bookId" DROP DEFAULT;
ALTER TABLE "##PREFIX##TEIFiles"
   ALTER COLUMN "bookId" DROP DEFAULT;
ALTER TABLE "##PREFIX##TEIFiles"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "##PREFIX##TEIFiles"
   ALTER COLUMN "bindingId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Authors"
   ALTER COLUMN "authorId" DROP DEFAULT;
ALTER TABLE "##PREFIX##Authors"
   ALTER COLUMN "bookId" DROP DEFAULT;
   
COMMIT;

