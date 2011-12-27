BEGIN TRANSACTION;
 
-- Add Notes table.
 
CREATE TABLE "Notes"
(
    "userId" integer NOT NULL,
    "text" text, 
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),
    
    PRIMARY KEY ("userId"),
    FOREIGN KEY ("userId")
        REFERENCES "Users"
);
 
COMMIT;