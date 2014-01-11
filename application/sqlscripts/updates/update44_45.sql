BEGIN TRANSACTION;

-- Change help tables.
DROP TABLE "##PREFIX##HelpControlItems";
ALTER TABLE "##PREFIX##HelpPages" DROP COLUMN "content";
ALTER TABLE "##PREFIX##HelpPages" DROP COLUMN "parentHelpPageId";

-- HelpControlItems will be replaced by HelpParagraphs
CREATE TABLE "##PREFIX##HelpParagraphs"
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
      REFERENCES "##PREFIX##HelpPages",
    FOREIGN KEY ("paragraphParentId")
      REFERENCES "##PREFIX##HelpParagraphs",
    FOREIGN KEY ("actionName")
      REFERENCES "##PREFIX##Permissions"
);

COMMIT;
