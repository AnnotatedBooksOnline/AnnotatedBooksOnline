BEGIN TRANSACTION;

-- For the users that still had column bookID in BookLanguages
ALTER TABLE "##PREFIX##BookLanguages" RENAME "bookID" TO "bookId";

COMMIT;

BEGIN TRANSACTION;

-- Splits up BookLanguages table in two tables: one for bindings and one for books.
ALTER TABLE "##PREFIX##BookLanguages" DROP CONSTRAINT "##PREFIX##BookLanguages_pkey";
ALTER TABLE "##PREFIX##BookLanguages" DROP COLUMN "bookLanguageId";
ALTER TABLE "##PREFIX##BookLanguages" DROP COLUMN "bindingId";
DELETE FROM "##PREFIX##BookLanguages" WHERE "bookId" IS NULL;
ALTER TABLE "##PREFIX##BookLanguages" ALTER COLUMN "bookId" SET NOT NULL;
ALTER TABLE "##PREFIX##BookLanguages" ADD PRIMARY KEY ("bookId", "languageId");

CREATE TABLE "##PREFIX##BindingLanguages"
(
    "bindingId" integer NOT NULL,
    "languageId" integer NOT NULL,    
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("bindingId", "languageId"),
    FOREIGN KEY ("bindingId")
      REFERENCES "##PREFIX##Bindings",
    FOREIGN KEY ("languageId")
      REFERENCES "##PREFIX##Languages"
);


COMMIT;

