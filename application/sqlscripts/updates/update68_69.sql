BEGIN TRANSACTION;

-- Redesigns HelpParagraphs, allowing content to depend on a setting.

-- Create HelpContents table.
CREATE TABLE "HelpContents"
(
    "helpContentId" serial NOT NULL,
    "helpParagraphId" integer NOT NULL,
    "settingValue" text,
    "content" text NOT NULL,

    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("helpContentId"),
    FOREIGN KEY ("helpParagraphId")
      REFERENCES "HelpParagraphs"
    
    UNIQUE ("helpParagraphId", "settingValue");
);

-- Move contents from HelpParagraphs to new table.
INSERT INTO "HelpContents" ("helpParagraphId", "content") 
  (SELECT "helpParagraphId", "content" FROM "HelpParagraphs");

-- Remove content column from HelpParagraphs and add settingName.
ALTER TABLE "HelpParagraphs" DROP COLUMN "content";
ALTER TABLE "HelpParagraphs" ADD COLUMN "settingName" varchar(100);
ALTER TABLE "HelpParagraphs" ADD FOREIGN KEY ("settingName")
                                   REFERENCES "Settings";

COMMIT;
