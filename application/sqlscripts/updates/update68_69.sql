BEGIN TRANSACTION;

-- Redesigns HelpParagraphs, allowing content to depend on a setting.

-- Create HelpContents table.
CREATE TABLE "##PREFIX##HelpContents"
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
      REFERENCES "##PREFIX##HelpParagraphs",
    
    UNIQUE ("helpParagraphId", "settingValue")
);

-- Move contents from HelpParagraphs to new table.
INSERT INTO "##PREFIX##HelpContents" ("helpParagraphId", "content") 
  (SELECT "helpParagraphId", "content" FROM "##PREFIX##HelpParagraphs");

-- Remove content column from HelpParagraphs and add settingName.
ALTER TABLE "##PREFIX##HelpParagraphs" DROP COLUMN "content";
ALTER TABLE "##PREFIX##HelpParagraphs" ADD COLUMN "settingName" varchar(100);
ALTER TABLE "##PREFIX##HelpParagraphs" ADD FOREIGN KEY ("settingName")
                                   REFERENCES "##PREFIX##Settings";

COMMIT;
