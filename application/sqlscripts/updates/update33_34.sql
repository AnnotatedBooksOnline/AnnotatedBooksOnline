BEGIN TRANSACTION;

-- Splits up BookLanguages table in two tables: one for bindings and one for books.
ALTER TABLE "BookLanguages" DROP CONSTRAINT "BookLanguages_pkey";
ALTER TABLE "BookLanguages" DROP COLUMN "bookLanguageId";
ALTER TABLE "BookLanguages" DROP COLUMN "bindingId";
DELETE FROM "BookLanguages" WHERE "bookId" IS NULL;
ALTER TABLE "BookLanguages" ALTER COLUMN "bookId" SET NOT NULL;
ALTER TABLE "BookLanguages" ADD PRIMARY KEY ("bookId", "languageId");

CREATE TABLE "BindingLanguages"
(
    "bindingId" integer NOT NULL,
    "languageId" integer NOT NULL,    
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("bindingId", "languageId"),
    FOREIGN KEY ("bindingId")
      REFERENCES "Bindings",
    FOREIGN KEY ("languageId")
      REFERENCES "Languages"
);


COMMIT;
