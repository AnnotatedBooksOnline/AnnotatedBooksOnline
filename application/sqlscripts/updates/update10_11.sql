BEGIN TRANSACTION;

-- Add Uploads table.

CREATE TABLE "##PREFIX##Uploads"
(
    "uploadId" serial NOT NULL,
    "userId" serial NOT NULL,
    "token" varchar(48) NOT NULL,
    "filename" varchar(255) NOT NULL,
    "size" integer NOT NULL,
    "timestamp" timestamp NOT NULL,
    "status" smallint NOT NULL,
    
    "createdOn" timestamp,
    "createdBy" varchar(30),
    "changedOn" timestamp,
    "changedBy" varchar(30),

    PRIMARY KEY ("uploadId"),
    UNIQUE ("token"),
    FOREIGN KEY ("userId")
        REFERENCES "##PREFIX##Users"
);

COMMIT;
