BEGIN TRANSACTION;

-- Adds two tables to be used by Help.

CREATE TABLE "HelpPages"
(
    "helpPageId" serial NOT NULL,
    "pageName" varchar(30) NOT NULL,
    "content" text NOT NULL,
    "parentHelpPageId" integer,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("helpPageId"),
    UNIQUE ("pageName"),
    FOREIGN KEY ("parentHelpPageId")
      REFERENCES "HelpPages"
);

CREATE TABLE "HelpControlItems"
(
    "controlItemName" varchar(30) NOT NULL,
    "helpPageId" integer NOT NULL,
    "marker" varchar(30) NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("controlItemName"),
    FOREIGN KEY ("helpPageId")
      REFERENCES "HelpPages"
);

COMMIT;
