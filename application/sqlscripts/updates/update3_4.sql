-- The Book/binding <-> language relation now has its own primary key. 
-- Also, bookId is now nullable since a binding can have a language that one of its books does not have. 
ALTER TABLE "BookLanguages" DROP CONSTRAINT "BookLanguages_pkey";
ALTER TABLE "BookLanguages"
   ALTER COLUMN "bookId" DROP NOT NULL;
ALTER TABLE "BookLanguages" ADD COLUMN "bookLanguageId" serial;
ALTER TABLE "BookLanguages" ADD PRIMARY KEY ("bookLanguageId");
ALTER TABLE "BookLanguages" ADD UNIQUE ("bindingId", "language", "bookId");

-- E-mails have a maximum length of 256 rather than 255.
ALTER TABLE "Users" ALTER email TYPE character varying(256);

-- Default of Users.rank should be 10, not 50.
ALTER TABLE "Users"
   ALTER COLUMN rank SET DEFAULT 10;

