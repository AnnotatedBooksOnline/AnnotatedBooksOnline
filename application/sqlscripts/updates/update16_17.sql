-- Add languages table.

BEGIN TRANSACTION;

CREATE TABLE "Languages"
(
    "languageId" serial NOT NULL,
    "languageName" varchar(30) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("languageId"),
    UNIQUE ("languageName")
);

-- Deletes all already present language data. Which at this point doesn't really matter.
TRUNCATE TABLE "BookLanguages";

ALTER TABLE "BookLanguages" DROP COLUMN "language";
ALTER TABLE "BookLanguages" ADD COLUMN "languageId" integer NOT NULL;
ALTER TABLE "BookLanguages" ADD FOREIGN KEY ("languageId") REFERENCES "Languages";

COMMIT;
