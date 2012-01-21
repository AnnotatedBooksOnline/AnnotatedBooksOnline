BEGIN TRANSACTION;

-- Change help tables.
DROP TABLE "HelpControlItems";
ALTER TABLE "HelpPages" DROP COLUMN "content";
ALTER TABLE "HelpPages" DROP COLUMN "parentHelpPageId";

-- HelpControlItems will be replaced by HelpParagraphs
CREATE TABLE "HelpParagraphs"
(
    "helpParagraphId" serial NOT NULL,
    "helpPageId" integer NOT NULL,
    "paragraphParentId" integer,
    "actionName" varchar(50),
    "title" varchar(30) NOT NULL,
    "content" text NOT NULL,

    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("helpParagraphId"),
    FOREIGN KEY ("helpPageId")
      REFERENCES "HelpPages",
    FOREIGN KEY ("paragraphParentId")
      REFERENCES "HelpParagraphs",
    FOREIGN KEY ("actionName")
      REFERENCES "Permissions"
);

COMMIT;