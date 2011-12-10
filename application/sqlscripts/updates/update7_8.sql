BEGIN TRANSACTION;

-- Add settings table.

CREATE TABLE "Settings"
(
    "settingName" varchar(100) NOT NULL,
    "settingValue" text,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("settingName")
);

COMMIT;

