BEGIN TRANSACTION;

-- The Book/binding <-> language relation now has its own primary key. 
-- Also, bookID is now nullable since a binding can have a language that one of its books does not have. 
ALTER TABLE "##PREFIX##BookLanguages" DROP CONSTRAINT "##PREFIX##BookLanguages_pkey";
ALTER TABLE "##PREFIX##BookLanguages"
   ALTER COLUMN "bookID" DROP NOT NULL;
ALTER TABLE "##PREFIX##BookLanguages" ADD COLUMN "bookLanguageId" serial;
ALTER TABLE "##PREFIX##BookLanguages" ADD PRIMARY KEY ("bookLanguageId");
ALTER TABLE "##PREFIX##BookLanguages" ADD UNIQUE ("bindingId", "language", "bookID");

-- E-mails have a maximum length of 256 rather than 255.
ALTER TABLE "##PREFIX##Users" ALTER email TYPE character varying(256);

-- Default of Users.rank should be 10, not 50.
ALTER TABLE "##PREFIX##Users"
   ALTER COLUMN rank SET DEFAULT 10;

COMMIT;

