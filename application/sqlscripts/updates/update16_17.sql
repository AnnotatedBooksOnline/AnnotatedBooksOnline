-- Add languages table.

BEGIN TRANSACTION;

CREATE TABLE "##PREFIX##Languages"
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
TRUNCATE TABLE "##PREFIX##BookLanguages";

ALTER TABLE "##PREFIX##BookLanguages" DROP COLUMN "language";
ALTER TABLE "##PREFIX##BookLanguages" ADD COLUMN "languageId" integer NOT NULL;
ALTER TABLE "##PREFIX##BookLanguages" ADD FOREIGN KEY ("languageId") REFERENCES "##PREFIX##Languages";

COMMIT;
